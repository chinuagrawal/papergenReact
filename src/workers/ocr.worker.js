import { runOCR } from "../services/documentAI.service.js";
import { fetchRawOCRJson } from "../services/ocrOutput.service.js";
import { updateOCRJob } from "../models/ocrJob.model.js";
import { saveOcrJsonToGcs } from "../services/gcsOcrStorage.service.js";

export async function processOCRJob(ocrJobId, pdfUrl) {
  try {
    await updateOCRJob(ocrJobId, "processing");

    // 1️⃣ Run OCR
    const outputPrefix = await runOCR(
      process.env.DOCUMENT_AI_PROCESSOR,
      pdfUrl,
      ocrJobId
    );

    // 2️⃣ Fetch raw OCR JSON (from Document AI output bucket)
    const ocrJsonArray = await fetchRawOCRJson(outputPrefix);

    // 3️⃣ Save OCR JSON to GCS (YOUR bucket)
    const gcsPath = await saveOcrJsonToGcs(ocrJobId, ocrJsonArray);

    // 4️⃣ Update DB
    await updateOCRJob(ocrJobId, "completed", null, gcsPath);

    console.log(`✅ OCR saved to GCS: ${gcsPath}`);
    console.log(`✅ OCR completed for job ${ocrJobId}`);

  } catch (err) {
    await updateOCRJob(ocrJobId, "failed", err.message);
    throw err;
  }
}
