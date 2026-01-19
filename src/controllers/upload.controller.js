import fs from "fs";
import { uploadToGCS } from "../services/gcs.service.js";
import { createOCRJob } from "../models/ocrJob.model.js";
import { processOCRJob } from "../workers/ocr.worker.js";

export const uploadChapterPDF = async (req, res) => {
  try {
    const { chapterId } = req.body;

    if (!chapterId || !req.file) {
      return res.status(400).json({ error: "chapterId and PDF required" });
    }

    const gcsPath = `uploads/pdfs/chapter-${chapterId}.pdf`;
    const pdfUrl = await uploadToGCS(req.file.path, gcsPath);

    const job = await createOCRJob(chapterId, pdfUrl);

    // ✅ AUTO START OCR (NO REDIS)
    processOCRJob(job.id, pdfUrl).catch(console.error);

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      jobId: job.id,
      message: "PDF uploaded & OCR started",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};
