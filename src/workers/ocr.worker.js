import { runOCR } from "../services/documentAI.service.js";
import { fetchRawOCRJson } from "../services/ocrOutput.service.js";
import { saveRawOCRToDisk } from "../services/rawOcrStorage.service.js";
import { updateOCRJob } from "../models/ocrJob.model.js";

export async function processOCRJob(ocrJobId, pdfUrl) {
  try {
    await updateOCRJob(ocrJobId, {
      status: "processing",
      error: null,
    });

    const outputPrefix = await runOCR(
      process.env.DOCUMENT_AI_PROCESSOR,
      pdfUrl,
      ocrJobId
    );

    const ocrJsonArray = await fetchRawOCRJson(outputPrefix);
    const storedPath = saveRawOCRToDisk(ocrJobId, ocrJsonArray);

    await updateOCRJob(ocrJobId, {
      status: "completed",
      output_path: storedPath,
    });

    console.log(`✅ OCR completed for job ${ocrJobId}`);
  } catch (err) {
    await updateOCRJob(ocrJobId, {
      status: "failed",          // ✅ short value
      error: err.message,        // ✅ long message goes here
    });
    throw err;
  }
}
