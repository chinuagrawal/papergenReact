import express from "express";
import { pdfUpload } from "../middlewares/pdfUpload.js";
import { uploadChapterPDF } from "../controllers/upload.controller.js";

const router = express.Router();

/**
 * IMPORTANT:
 * NO json/urlencoded middleware
 * ONLY multer + controller
 */
router.post(
  "/upload-pdf",
  pdfUpload.single("pdf"),
  uploadChapterPDF
);

export default router;
