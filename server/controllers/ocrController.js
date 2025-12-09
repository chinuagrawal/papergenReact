// controllers/ocrController.js
const fs = require('fs');
const path = require('path');
const os = require('os');

// Google Clients
const vision = require('@google-cloud/vision');
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;

const keyFile = path.resolve(__dirname, '../google-vision-key.json');

const visionClient = new vision.ImageAnnotatorClient({ keyFilename: keyFile });
const docClient = new DocumentProcessorServiceClient({ keyFilename: keyFile });

// Utils
const { uploadToGCS } = require('../utils/uploadToGCS');
const { extractQuestions } = require('../utils/parser');
const { convertPdfToImages } = require('../utils/pdfToImages');
const { cropFromBBox } = require('../utils/cropImage');
const db = require('../utils/db');

exports.processUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const localPath = req.file.path;

    // 1. Document AI TEXT + LAYOUT
    const name = `projects/${process.env.GCLOUD_PROJECT}/locations/us/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`;

    const buffer = fs.readFileSync(localPath);

    const request = {
      name,
      rawDocument: {
        content: buffer.toString("base64"),
        mimeType: "application/pdf"
      }
    };

    const [result] = await docClient.processDocument(request);

    const text = result.document?.text || '';
    const pages = result.document?.pages || [];

    // 2. CREATE DOCUMENT ROW (upload original pdf)
    const fileGcsUri = await uploadToGCS(localPath, `uploads/${Date.now()}_${req.file.originalname}`);

    const documentRow = await db.insertDocument({
      filename: req.file.originalname,
      gcsUri: fileGcsUri,
      mimeType: req.file.mimetype
    });

    // 3. PDF → IMAGES
    // convertPdfToImages should return array of local image paths in same order as pages
    const pageImages = await convertPdfToImages(localPath);

    // 4. PARSE QUESTIONS (from whole extracted text)
    const questions = extractQuestions(text);
    const insertedQuestions = [];

    for (const q of questions) {
      const qRow = await db.insertQuestion({
        documentId: documentRow.id,
        questionText: q.questionText,
        marks: q.marks,
        qtype: q.qtype,
        bbox: null,
        pageNum: null
      });
      insertedQuestions.push(qRow);
    }

    // 5. EXTRACT FIGURES / IMAGES USING LAYOUT BBOX
    const savedCrops = [];

    // iterate pages in order and await operations
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const page = pages[pageIndex];
      const pageImagePath = pageImages[pageIndex];

      if (!pageImagePath || !fs.existsSync(pageImagePath)) {
        console.warn(`No page image found for page index ${pageIndex}`);
        continue;
      }

      const blocks = page.blocks || [];
      // if there are no blocks, skip
      if (!blocks.length) continue;

      // process blocks sequentially
      for (const block of blocks) {
        try {
          const verts = block.layout?.boundingPoly?.vertices;
          if (!verts || !Array.isArray(verts) || verts.length === 0) continue;

          // vertices may be in the form [{x,y}, ...]. compute rectangular bbox
          const xs = verts.map(v => (typeof v.x === 'number' ? v.x : 0));
          const ys = verts.map(v => (typeof v.y === 'number' ? v.y : 0));

          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);

          const width = maxX - minX;
          const height = maxY - minY;

          // skip tiny blocks
          if (width <= 1 || height <= 1) continue;

          // area threshold (document AI coordinates might be in pixels or normalized 0..1)
          // If coords are normalized (0..1) area will be small; but cropFromBBox will detect normalization.
          const area = Math.abs(width * height);
          if (area < 20000 && !(width <= 1 && height <= 1)) {
            // if coordinates are pixels and area small, skip likely text blocks
            continue;
          }

          // prepare temp out path
          const outFileName = `crop_${Date.now()}_${Math.random().toString(36).slice(2,8)}.png`;
          const outPath = path.join(os.tmpdir(), outFileName);

          // call cropFromBBox. It accepts normalized or pixel coords based on implementation.
          // We pass left/top/width/height
          await cropFromBBox(pageImagePath, outPath, { left: minX, top: minY, width, height });

          // upload crop to GCS
          const gcsPath = `crops/${Date.now()}_${outFileName}`;
          const gcsUri = await uploadToGCS(outPath, gcsPath);

          // attach to last inserted question if exists, otherwise set questionId null
          const lastQ = insertedQuestions[insertedQuestions.length - 1];
          const questionId = lastQ ? lastQ.id : null;

          // insert question image row
          await db.insertQuestionImage({
            questionId,
            documentId: documentRow.id,
            pageNum: pageIndex + 1,
            gcsUri,
            caption: null
          });

          savedCrops.push({ page: pageIndex + 1, gcsUri, localPath: outPath });

          // remove temp file after upload
          try { fs.unlinkSync(outPath); } catch (e) { /* ignore cleanup errors */ }

        } catch (blockErr) {
          // log and continue with next block
          console.error(`Failed to crop/upload block on page ${pageIndex + 1}:`, {
            error: blockErr?.message || blockErr,
            block: block
          });
          continue;
        }
      } // end for block
    } // end for page

    return res.json({
      success: true,
      textExtracted: true,
      document: documentRow,
      questionCount: insertedQuestions.length,
      cropsSaved: savedCrops.map(c => c.gcsUri),
      questions: insertedQuestions
    });

  } catch (err) {
    console.error("OCR ERROR:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
