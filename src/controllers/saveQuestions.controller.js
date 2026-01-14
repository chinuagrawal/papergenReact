import { saveQuestions } from "../services/questionSave.service.js";
import fs from "fs";
import path from "path";
import { normalizeLayout } from "../parser/layoutNormalizer.js";
import { detectQuestions } from "../parser/questionDetector.js";
import { processAnswers } from "../parser/answerProcessor.js";
import { detectMarksAndType } from "../parser/marksAndTypeDetector.js";

export async function saveExtractedQuestions(req, res) {
  try {
    const { chapterId, ocrJobId } = req.body;

    if (!chapterId || !ocrJobId) {
      return res.status(400).json({ error: "Missing chapterId or ocrJobId" });
    }

    const dir = `ocr-output/job-${ocrJobId}`;
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

    const ocrJsonArray = files.map(f =>
      JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"))
    );

    // 🔥 Full pipeline
    const blocks = normalizeLayout(ocrJsonArray);
    const q1 = detectQuestions(blocks);
    const q2 = processAnswers(q1);
    const finalQuestions = detectMarksAndType(q2);

    await saveQuestions({
      chapterId,
      ocrJobId,
      questions: finalQuestions
    });

    res.json({
      success: true,
      count: finalQuestions.length
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to save questions" });
  }
}
