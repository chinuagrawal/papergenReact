// src/controllers/upload.controller.js
import fs from "fs";
import { uploadToGCS } from "../services/gcs.service.js";
import { createOCRJob } from "../models/ocrJob.model.js";
import ocrQueue from "../queue/ocrQueue.js";

// REMOVE the [upload.single("pdf"), ...] array wrapper
export const uploadChapterPDF = async (req, res) => {
  try {
    const { chapterId } = req.body;

    // Check if file exists (provided by the route middleware)
    if (!chapterId || !req.file) {
      return res.status(400).json({ error: "chapterId and PDF required" });
    }

    const gcsPath = `uploads/pdfs/chapter-${chapterId}.pdf`;
    
    // This requires Disk Storage (req.file.path)
    const pdfUrl = await uploadToGCS(req.file.path, gcsPath);

    const job = await createOCRJob(chapterId, pdfUrl);

    await ocrQueue.add("process-ocr", {
      ocrJobId: job.id,
      pdfUrl,
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      jobId: job.id,
      message: "PDF uploaded & OCR started",
    });
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};