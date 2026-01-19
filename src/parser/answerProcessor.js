/**
 * Answer Processor
 * Cleans questions & answers ONLY
 * (NO sub-questions anywhere in project)
 */

export function processAnswers(questions = []) {
  return questions.map(q => ({
    ...q,
    questionText: cleanText(q.questionText),
    answer: cleanAnswer(q.answer),
  }));
}

/* ---------------- HELPERS ---------------- */

function cleanText(text = "") {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}

function cleanAnswer(answer = "") {
  return answer
    .replace(/^ans[\.\:\-]?\s*/i, "")
    .replace(/^answer[\.\:\-]?\s*/i, "")
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}
