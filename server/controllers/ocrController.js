// controllers/ocrController.js
const fs = require("fs");
const path = require("path");
const { uploadToGCS } = require("../utils/uploadToGCS");
const { extractQuestions } = require("../utils/parser");

const { DocumentProcessorServiceClient } = require("@google-cloud/documentai").v1;
const docClient = new DocumentProcessorServiceClient();

const { Document, Question } = require("../models");

exports.processUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const localPath = req.file.path;

    /* ===============================
       1. Process with Document AI
    ================================ */
    const name = `projects/${process.env.GCLOUD_PROJECT}/locations/us/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`;
    const buffer = await fs.promises.readFile(localPath);

    const request = {
      name,
      rawDocument: {
        content: buffer.toString("base64"),
        mimeType: "application/pdf",
      },
    };

    const [result] = await docClient.processDocument(request);
    const text = result.document?.text || "";

    /* ===============================
       2. Upload original PDF to GCS
    ================================ */
    const gcsUri = await uploadToGCS(
      localPath,
      `uploads/${Date.now()}_${req.file.originalname}`
    );

    const documentRow = await Document.create({
      filename: req.file.originalname,
      gcsUri,
      mimeType: req.file.mimetype,
      status: "processing",
    });

    /* ===============================
       3. Extract Questions
    ================================ */
    const questions = extractQuestions(text);
    const savedQuestions = [];

    for (const q of questions) {
      const created = await Question.create({
        documentId: documentRow.id,
        questionText: q.questionText,
        answerText: q.answerText || null,
        marks: q.marks || null,
        qtype: q.qtype || "unknown",
        pageNum: q.pageNum || null,
        bbox: null, // removed image dependency
      });
      savedQuestions.push(created);
    }

    /* ===============================
       4. Mark document completed
    ================================ */
    await Document.update(
      { status: "done" },
      { where: { id: documentRow.id } }
    );

    // cleanup temp file
    try { fs.unlinkSync(localPath); } catch {}

    return res.json({
      success: true,
      documentId: documentRow.id,
      questionCount: savedQuestions.length,
    });

  } catch (err) {
    console.error("OCR ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
