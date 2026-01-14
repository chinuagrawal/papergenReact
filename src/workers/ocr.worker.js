import { runOCR } from "../services/documentAI.service.js";
import { fetchRawOCRJson } from "../services/ocrOutput.service.js";
import { saveRawOCRToDisk } from "../services/rawOcrStorage.service.js";
import { updateOCRJob } from "../models/ocrJob.model.js";

export async function processOCRJob(ocrJobId, pdfUrl) {
  try {
    await updateOCRJob(ocrJobId, "processing");

    // 1️⃣ Run OCR
    const outputPrefix = await runOCR(
      process.env.DOCUMENT_AI_PROCESSOR,
      pdfUrl,
      ocrJobId
    );

    // 2️⃣ Fetch raw OCR JSON
    const ocrJsonArray = await fetchRawOCRJson(outputPrefix);

    // 3️⃣ Store raw OCR JSON
    const storedPath = saveRawOCRToDisk(ocrJobId, ocrJsonArray);

    // 4️⃣ Mark job complete
    await updateOCRJob(ocrJobId, "completed");

    console.log(
      `✅ OCR completed for job ${ocrJobId}, saved at ${storedPath}`
    );
  } catch (err) {
    await updateOCRJob(ocrJobId, "failed", err.message);
    throw err;
  }
}
