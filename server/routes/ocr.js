const express = require("express");
const multer = require("multer");
const { processUpload } = require("../controllers/ocrController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/pdf", upload.single("pdf"), processUpload);

module.exports = router;
