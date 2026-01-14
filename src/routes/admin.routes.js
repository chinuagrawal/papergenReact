import express from "express";
const router = express.Router();

import { pdfUpload } from "../middlewares/pdfUpload.js";
import { upload } from "../middlewares/multer.js";

/* OCR */
import { uploadChapterPDF } from "../controllers/upload.controller.js";
import { processOCRJob } from "../workers/ocr.worker.js";
import { saveExtractedQuestions } from "../controllers/saveQuestions.controller.js";

/* Admin Review */
import { getQuestionsByChapter } from "../controllers/adminQuestions.controller.js";
import { updateQuestion } from "../controllers/updateQuestion.controller.js";
import { updateSubQuestion } from "../controllers/updateSubQuestion.controller.js";
import { uploadQuestionImage } from "../controllers/imageUpload.controller.js";
import { approveOcrJob } from "../controllers/approveOcr.controller.js";

/* Master Data */
import {
  addBoard, getBoards,
  addClass, getClasses,
  addSubject, getSubjects,
  addBook, getBooks,
  addChapter, getChapters
} from "../controllers/masterData.controller.js";


/* ---------- OCR UPLOAD ---------- */
/**
 * Upload chapter PDF (multipart)
 * POST /api/admin/upload-pdf
 */
router.post(
  "/upload-pdf",
  pdfUpload.single("pdf"),   // 🔑 THIS WAS MISSING
  uploadChapterPDF
);

router.post("/run-ocr-now", async (req, res) => {
  const { ocrJobId, pdfUrl } = req.body;
  await processOCRJob(ocrJobId, pdfUrl);
  res.json({ success: true });
});

router.post("/save-questions", saveExtractedQuestions);

/* ---------- REVIEW ---------- */
router.get("/questions/:chapterId", getQuestionsByChapter);
router.put("/question/:id", updateQuestion);
router.put("/sub-question/:id", updateSubQuestion);
router.post("/upload-image", upload.single("image"), uploadQuestionImage);
router.post("/approve-ocr", approveOcrJob);

/* ---------- MASTER DATA ---------- */
router.post("/boards", addBoard);
router.get("/boards", getBoards);

router.post("/classes", addClass);
router.get("/classes", getClasses);

router.post("/subjects", addSubject);
router.get("/subjects", getSubjects);

router.post("/books", addBook);
router.get("/books", getBooks);

router.post("/chapters", addChapter);
router.get("/chapters", getChapters);

export default router;
