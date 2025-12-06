const fs = require("fs");
const vision = require("@google-cloud/vision");
const { DocumentProcessorServiceClient } = require("@google-cloud/documentai").v1;
const { uploadToGCS } = require("../utils/uploadToGCS");

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const docClient = new DocumentProcessorServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// 🔹 Document AI OCR for PDF
async function processPDF(localPath) {
  const name = `projects/${process.env.GCLOUD_PROJECT}/locations/us/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`;
  const fileData = fs.readFileSync(localPath);

  const request = {
    name,
    rawDocument: {
      content: fileData.toString("base64"),
      mimeType: "application/pdf",
    },
  };

  const [result] = await docClient.processDocument(request);
  const text = result.document.text || "";

  return text;
}

// 🔹 Vision OCR for images
async function processImage(localPath) {
  const [result] = await visionClient.documentTextDetection(localPath);
  const text = result.fullTextAnnotation?.text || "";
  return text;
}

// 🔹 Main route handler
exports.processUpload = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });

    const file = req.file;
    const filePath = file.path;

    if (file.originalname.toLowerCase().endsWith(".pdf")) {
      // PDF → Document AI
      const text = await processPDF(filePath);
      return res.json({ success: true, engine: "document-ai", text });
    } else {
      // Image → Vision OCR
      const text = await processImage(filePath);
      return res.json({ success: true, engine: "vision", text });
    }
  } catch (err) {
    console.error("OCR ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
