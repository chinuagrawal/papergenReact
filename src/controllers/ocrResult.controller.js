import fs from "fs";
import path from "path";

import { normalizeLayout } from "../parser/layoutNormalizer.js";
import { detectQuestions } from "../parser/questionDetector.js";
import { processAnswers } from "../parser/answerProcessor.js";

export async function getOCRResult(req, res) {
  try {
    const { jobId } = req.params;

    const dir = path.join(
      process.cwd(),
      "ocr-output",
      `job-${jobId}`
    );

    if (!fs.existsSync(dir)) {
      return res.status(404).json({
        success: false,
        error: "OCR output not found",
      });
    }

    const files = fs
      .readdirSync(dir)
      .filter(f => f.endsWith(".json"))
      .sort();

    const ocrJsonArray = files.map(file =>
      JSON.parse(
        fs.readFileSync(path.join(dir, file), "utf8")
      )
    );

    // ✅ YOUR EXISTING PARSERS
    const blocks = normalizeLayout(ocrJsonArray);
    let questions = detectQuestions(blocks);
    questions = processAnswers(questions);

    res.json({
      success: true,
      jobId,
      totalQuestions: questions.length,
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
