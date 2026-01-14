/**
 * Answer Processor
 * Cleans and correctly links answers to questions / sub-questions
 */

export function processAnswers(questions) {
  return questions.map(q => {
    const cleaned = { ...q };

    cleaned.questionText = cleanText(cleaned.questionText);
    cleaned.answer = cleanAnswer(cleaned.answer);

    // 🔹 If sub-questions exist and answer is a list, split it
    // Attach sub-answers ONLY if answer explicitly labels them
if (
  cleaned.subQuestions.length > 0 &&
  hasExplicitSubAnswers(cleaned.answer)
) {
  cleaned.subQuestions = attachAnswersToSubQuestions(
    cleaned.subQuestions,
    cleaned.answer
  );
  cleaned.answer = "";
}

    return cleaned;
  });
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
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
}

function attachAnswersToSubQuestions(subQuestions, answerText) {
  const parts = answerText
    .split(/\(?([a-z]|[ivx]+)\)?[\.\)]\s+/i)
    .filter(Boolean);

  // parts = [label, text, label, text...]

  const answerMap = {};
  for (let i = 0; i < parts.length - 1; i += 2) {
    answerMap[parts[i].toLowerCase()] = parts[i + 1];
  }

  return subQuestions.map(sq => ({
    ...sq,
    answer: answerMap[sq.label.toLowerCase()] || ""
  }));
}
function hasExplicitSubAnswers(answer = "") {
  return /(^|\n|\s)(\(?([a-z]|[ivx]{1,3})\)?[\.\)])\s+/i.test(answer);
}
