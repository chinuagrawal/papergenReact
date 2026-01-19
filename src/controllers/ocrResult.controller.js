import { getOCRJob } from "../models/ocrJob.model.js";
import { normalizeLayout } from "../parser/layoutNormalizer.js";
import { detectQuestions } from "../parser/questionDetector.js";
import { processAnswers } from "../parser/answerProcessor.js";
import { readOcrJsonFromGcs } from "../services/gcsOcrStorage.service.js";

export async function getOCRResult(req, res) {
  const { jobId } = req.params;

  const job = await getOCRJob(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: "OCR job not found",
    });
  }

  // 🔑 KEY FIX
  if (job.status !== "completed") {
    return res.json({
      success: true,
      status: job.status,
      message: "OCR still processing",
      questions: [],
    });
  }

  try {
    const ocrJsonArray = await readOcrJsonFromGcs(jobId);

    const blocks = normalizeLayout(ocrJsonArray);
    let questions = detectQuestions(blocks);
    questions = processAnswers(questions);

    res.json({
      success: true,
      status: "completed",
      questions,
    });
  } catch (err) {
    console.error("OCR RESULT ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
