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

  // Sort pages by page number to process in order
  pages.sort((a, b) => a.page - b.page);

  const allQuestions = [];
  let lastQuestionNumber = 0;

  for (const page of pages) {
    // 🔥 AI now returns ARRAY directly
    // Pass lastQuestionNumber as context (but AI should use actual numbers from document)
    const questions = await segmentQuestionsAI(
      page.page,
      page.blocks,
      lastQuestionNumber
    );

    if (!Array.isArray(questions)) {
      throw new Error("AI did not return an array of questions");
    }

    questions.forEach(q => {
      // Track the highest question number for context on next page
      if (q.questionNumber && q.questionNumber > lastQuestionNumber) {
        lastQuestionNumber = q.questionNumber;
      }

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

  // Post-process: Extract question numbers from questionText if missing
  // This is a fallback in case AI didn't extract the number properly
  for (const q of allQuestions) {
    if (!q.questionNumber) {
      // Try to extract number from questionText as fallback
      const numMatch = q.questionText.match(/^(\d+)[\.\)\:\-]\s*/);
      if (numMatch) {
        q.questionNumber = parseInt(numMatch[1], 10);
      }
    }
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
