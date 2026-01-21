import { normalizeLayout } from "../parser/layoutNormalizer.js";
import { groupBlocksByPage } from "../utils/groupBlocksByPage.js";
import { segmentQuestionsAI } from "../ai/qaSegmenter.service.js";

export async function extractQuestionsWithAI(ocrJsonArray) {
  const blocks = normalizeLayout(ocrJsonArray);
  const pages = groupBlocksByPage(blocks);

  const allQuestions = [];

  for (const page of pages) {
    const aiResult = await segmentQuestionsAI(
      page.page,
      page.blocks
    );

    aiResult.forEach(q => {
      allQuestions.push({
        questionText: q.questionText,
        answer: q.answer,
        confidence: q.confidence,
        page: page.page,
      });
    });
  }

  return allQuestions;
}
