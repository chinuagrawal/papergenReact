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
        questionNumber: q.questionNumber || null,
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

  // Sort questions by questionNumber, then by page, then by original order
  allQuestions.sort((a, b) => {
    // First sort by question number if available
    if (a.questionNumber && b.questionNumber) {
      return a.questionNumber - b.questionNumber;
    }
    if (a.questionNumber) return -1;
    if (b.questionNumber) return 1;
    
    // Then by page
    if (a.page !== b.page) {
      return (a.page || 0) - (b.page || 0);
    }
    
    // Finally maintain original order for questions without numbers
    return 0;
  });

  return allQuestions;
}
