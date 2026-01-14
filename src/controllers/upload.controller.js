import multer from "multer";
import fs from "fs";

import { uploadToGCS } from "../services/gcs.service.js";
import { createOCRJob } from "../models/ocrJob.model.js";
import ocrQueue from "../queue/ocrQueue.js";

const upload = multer({ dest: "tmp/" });

export const uploadChapterPDF = [
  upload.single("pdf"),
  async (req, res) => {
    try {
      const { chapterId } = req.body;

      if (!chapterId || !req.file) {
        return res.status(400).json({ error: "chapterId and PDF required" });
      }

      const gcsPath = `uploads/pdfs/chapter-${chapterId}.pdf`;
      const pdfUrl = await uploadToGCS(req.file.path, gcsPath);

      const job = await createOCRJob(chapterId, pdfUrl);

      await ocrQueue.add("process-ocr", {
        ocrJobId: job.id,
        pdfUrl,
      });

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
  },
];
