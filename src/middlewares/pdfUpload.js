// src/middlewares/pdfUpload.js
import multer from "multer";

// Use diskStorage instead of memoryStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

export const pdfUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"), false);
    }
    cb(null, true);
  }
});