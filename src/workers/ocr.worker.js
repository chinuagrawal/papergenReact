import { runOCR } from "../services/documentAI.service.js";
import { fetchRawOCRJson } from "../services/ocrOutput.service.js";
import { extractQuestionsWithAI } from "../services/aiSegmentPipeline.service.js";
import { saveOcrJsonToGcs } from "../services/gcsOcrStorage.service.js";
import { updateOCRJob } from "../models/ocrJob.model.js";

export async function processOCRJob(ocrJobId, pdfUrl) {
  try {
    await updateOCRJob(ocrJobId, "processing");

    // 1️⃣ Run Document AI OCR
    const rawOcrPrefix = await runOCR(
      process.env.DOCUMENT_AI_PROCESSOR,
      pdfUrl,
      ocrJobId
    );

    // 2️⃣ Read RAW OCR JSON from GCS
    const rawOcrPages = await fetchRawOCRJson(rawOcrPrefix);

    // 3️⃣ AI-based Question Extraction
    const questions = await extractQuestionsWithAI(rawOcrPages);

    // 4️⃣ SAVE FINAL AI OUTPUT TO GCS ✅
    const outputPath = await saveOcrJsonToGcs(ocrJobId, {
      questions,
      meta: {
        extractedAt: new Date().toISOString(),
        jobId: ocrJobId
      }
    });

    // 5️⃣ Update job
    await updateOCRJob(ocrJobId, "completed", null, outputPath);

    console.log(`✅ OCR + AI completed for job ${ocrJobId}`);
  } catch (err) {
    await updateOCRJob(ocrJobId, "failed", err.message);
    console.error("❌ OCR job failed:", err);
  }
}
