import { normalizeLayout } from "../parser/layoutNormalizer.js";
import { groupBlocksByPage } from "../utils/groupBlocksByPage.js";
import { segmentQuestionsAI } from "../ai/qaSegmenter.service.js";

/**
 * Full AI-based question/answer extraction
 * RETURNS: Array of questions
 */
export async function extractQuestionsWithAI(ocrJsonArray) {
  const blocks = normalizeLayout(ocrJsonArray);
  const pages = groupBlocksByPage(blocks);

  const allQuestions = [];

  for (const page of pages) {
    // 🔥 AI now returns ARRAY directly
    const questions = await segmentQuestionsAI(
      page.page,
      page.blocks
    );

    if (!Array.isArray(questions)) {
      throw new Error("AI did not return an array of questions");
    }

    questions.forEach(q => {
      allQuestions.push({
        questionText: q.questionText,
        answer: q.answer,
        marks: q.marks,
        type: q.type,
        year: q.year,
        confidence: q.confidence,
        page: page.page,
      });
    });
  }

  return allQuestions;
}
