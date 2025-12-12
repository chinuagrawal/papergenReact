// controllers/ocrController.js
const fs = require('fs');
const path = require('path');
const os = require('os');
const { uploadToGCS } = require('../utils/uploadToGCS');
const { convertPdfToImages } = require('../utils/pdfToImages');
const { cropFromBBox } = require('../utils/cropImage');
const { extractQuestions } = require('../utils/parser');
const sizeOf = require('image-size');

const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const docClient = new DocumentProcessorServiceClient();

const { Document, Question, QuestionImage } = require('../models').sequelize ? require('../models') : require('../models');

function denormalizeVertices(verts, imgWidth, imgHeight) {
  const xs = verts.map(v => (typeof v.x === 'number' ? v.x : 0));
  const ys = verts.map(v => (typeof v.y === 'number' ? v.y : 0));
  const isNormalized = xs.every(x => x <= 1) && ys.every(y => y <= 1);
  return verts.map(v => {
    const nx = typeof v.x === 'number' ? v.x : 0;
    const ny = typeof v.y === 'number' ? v.y : 0;
    return {
      x: Math.round(isNormalized ? nx * imgWidth : nx),
      y: Math.round(isNormalized ? ny * imgHeight : ny)
    };
  });
}
function bboxFromVerts(vertsPx) {
  const xs = vertsPx.map(v => v.x);
  const ys = vertsPx.map(v => v.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return { left: Math.round(minX), top: Math.round(minY), width: Math.round(maxX - minX), height: Math.round(maxY - minY) };
}
function iou(a, b) {
  const x1 = Math.max(a.left, b.left);
  const y1 = Math.max(a.top, b.top);
  const x2 = Math.min(a.left + a.width, b.left + b.width);
  const y2 = Math.min(a.top + a.height, b.top + b.height);
  const w = Math.max(0, x2 - x1);
  const h = Math.max(0, y2 - y1);
  const inter = w * h;
  const union = a.width * a.height + b.width * b.height - inter;
  return union <= 0 ? 0 : inter / union;
}
function center(b) { return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }

exports.processUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const localPath = req.file.path;

    // 1. send to Document AI
    const name = `projects/${process.env.GCLOUD_PROJECT}/locations/us/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`;
    const buffer = await fs.promises.readFile(localPath);
    const request = {
      name,
      rawDocument: { content: buffer.toString('base64'), mimeType: 'application/pdf' }
    };
    const [result] = await docClient.processDocument(request);
    const text = result.document?.text || '';
    const pages = result.document?.pages || [];

    // 2. save original file (upload local or GCS)
    const fileGcsUri = await uploadToGCS(localPath, `uploads/${Date.now()}_${path.basename(localPath)}`);
    const documentRow = await require('../models').Document.create({
      filename: req.file.originalname,
      gcsUri: fileGcsUri,
      mimeType: req.file.mimetype,
      status: 'processing'
    });

    // 3. pdf -> page images
    const pageImages = await convertPdfToImages(localPath);

    // 4. parse questions from text
    const questions = extractQuestions(text);
    const insertedQuestions = [];
    for (const q of questions) {
      const created = await require('../models').Question.create({
        documentId: documentRow.id,
        questionText: q.questionText,
        answerText: q.answerText,
        marks: q.marks,
        qtype: q.qtype,
        pageNum: q.pageNum || null,
        bbox: q.bbox || null
      });
      insertedQuestions.push(created);
    }

    // 5. map page blocks -> pixel bboxes for matching
    const pageBlocksByIndex = [];
    for (let p = 0; p < pages.length; p++) {
      const page = pages[p];
      const imagePath = pageImages[p];
      let imgWidth = 1000, imgHeight = 1400;
      try {
        const dims = sizeOf(imagePath);
        imgWidth = dims.width; imgHeight = dims.height;
      } catch (e) {
        if (page.layout && page.layout.width && page.layout.height) {
          imgWidth = page.layout.width; imgHeight = page.layout.height;
        }
      }
      const blocks = (page.blocks || []).map(bl => {
        const verts = bl.layout?.boundingPoly?.vertices;
        if (!verts || !verts.length) return null;
        const vertsPx = denormalizeVertices(verts, imgWidth, imgHeight);
        const bbox = bboxFromVerts(vertsPx);
        // build block text if paragraphs exist
        const blockText = (bl.paragraphs || []).map(p => p.layout?.text || '').join(' ') || (bl.layout?.text || '');
        return { raw: bl, text: (blockText||'').trim(), bbox, pageImagePath: imagePath, imgWidth, imgHeight };
      }).filter(Boolean);
      pageBlocksByIndex[p] = blocks;
    }

    // helper to find matching image blocks for a question on a page
    function findImageBlocksForQuestion(q, pageIndex) {
      const blocks = pageBlocksByIndex[pageIndex] || [];
      if (blocks.length === 0) return [];
      // If parser gave bbox and pageNum, use that
      let qbox = q.bbox && q.pageNum === pageIndex + 1 ? q.bbox : null;
      if (!qbox) {
        // try to find block whose text contains first 8-15 words of question
        const qstart = (q.questionText || '').slice(0, 120).replace(/\s+/g, ' ').trim();
        for (const b of blocks) {
          if (!b.text) continue;
          const a = b.text.replace(/\s+/g, ' ').slice(0, 120);
          if ((a && qstart && (a.includes(qstart) || qstart.includes(a) || a.split(' ')[0] === qstart.split(' ')[0]))) {
            qbox = b.bbox; break;
          }
        }
      }
      const results = [];
      if (qbox) {
        for (const b of blocks) {
          // treat blocks with little text as image-like (text length small)
          const area = b.bbox.width * b.bbox.height;
          if (area < 2000) continue; // skip tiny ones
          const overlap = iou(qbox, b.bbox);
          const centDist = Math.abs(center(qbox).y - center(b.bbox).y);
          if (overlap >= 0.02 || centDist < 350) results.push({ block: b, overlap, centDist });
        }
        results.sort((a, b) => (b.overlap - a.overlap) || (a.centDist - b.centDist));
      } else {
        // fallback: prefer blocks with low textual length and big area
        for (const b of blocks) {
          const area = b.bbox.width * b.bbox.height;
          if (area < 8000) continue;
          if ((b.text || '').length < 40) results.push({ block: b, overlap: 0, centDist: 0 });
        }
        results.sort((a, b) => (b.block.bbox.width*b.block.bbox.height) - (a.block.bbox.width*a.block.bbox.height));
      }
      return results.slice(0, 2).map(r => r.block);
    }

    // 6. crop matched blocks and insert QuestionImage
    const savedCrops = [];
    for (let i = 0; i < insertedQuestions.length; i++) {
      const qRow = insertedQuestions[i];
      const q = questions[i] || {};
      const pageIndex = (q.pageNum ? q.pageNum - 1 : 0);
      const matches = findImageBlocksForQuestion(q, pageIndex);
      if (!matches || matches.length === 0) continue;
      for (const m of matches) {
        try {
          const outFileName = `crop_${Date.now()}_${Math.random().toString(36).slice(2,8)}.png`;
          const outPath = path.join(os.tmpdir(), outFileName);
          await cropFromBBox(m.pageImagePath, outPath, { left: m.bbox.left, top: m.bbox.top, width: m.bbox.width, height: m.bbox.height });
          const gcsPath = `crops/${Date.now()}_${outFileName}`;
          const gcsUri = await uploadToGCS(outPath, gcsPath);
          await require('../models').QuestionImage.create({
            questionId: qRow.id,
            documentId: documentRow.id,
            pageNum: pageIndex + 1,
            gcsUri,
            caption: null
          });
          savedCrops.push({ questionId: qRow.id, page: pageIndex + 1, gcsUri });
          try { fs.unlinkSync(outPath); } catch (e) {}
        } catch (e) {
          console.error('crop/upload failed', e.message || e);
        }
      }
    }

    // mark document done
    await require('../models').Document.update({ status: 'done' }, { where: { id: documentRow.id } });

    return res.json({
      success: true,
      document: documentRow,
      questionCount: insertedQuestions.length,
      cropsSaved: savedCrops
    });

  } catch (err) {
    console.error('OCR ERROR', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
