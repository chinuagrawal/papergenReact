/**
 * Question Detection Engine
 * Input: normalized text blocks
 * Output: questions with answers ONLY
 */

export function detectQuestions(blocks) {
  const questions = [];
  let currentQuestion = null;
  let collectingAnswer = false;

  for (const block of blocks) {
    const text = block.text.trim();
    if (!text || isInstruction(text)) continue;

    // 🔹 New Question
    const qMatch = matchMainQuestion(text);
    if (qMatch) {
      if (currentQuestion) questions.push(enrichQuestion(currentQuestion));

      currentQuestion = {
        questionNumber: qMatch.number,
        questionText: qMatch.text,
        answer: "",
        marks: null,
        type: null,
        difficulty: null
      };

      collectingAnswer = false;
      continue;
    }

    // 🔹 Answer start
    if (isAnswerStart(text)) {
      collectingAnswer = true;
      currentQuestion.answer += cleanAnswerText(text);
      continue;
    }

    // 🔹 Append content
    if (currentQuestion) {
      if (collectingAnswer) {
        currentQuestion.answer += " " + text;
      } else {
        currentQuestion.questionText += " " + text;
      }
    }
  }

  if (currentQuestion) questions.push(enrichQuestion(currentQuestion));

  return questions;
}

/* ---------- HELPERS ---------- */

function matchMainQuestion(text) {
  const patterns = [
    /^(\d+)[\.\)\:\-]\s*(.+)/,   // 1. Question
    /^Q(\d+)\s*(.+)/i           // Q1 Question
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return { number: match[1], text: match[2] };
    }
  }
  return null;
}

function isAnswerStart(text) {
  return /^ans[\.\:\-]/i.test(text) || /^answer[\.\:\-]/i.test(text);
}

function cleanAnswerText(text) {
  return text.replace(/^ans[\.\:\-]?\s*/i, "").trim();
}

function isInstruction(text) {
  return [
    "answer the following",
    "do as directed",
    "time:",
    "total marks",
    "instructions",
  ].some(k => text.toLowerCase().includes(k));
}

function enrichQuestion(q) {
  const len = q.questionText.length;

  if (len < 80) q.type = "Very Short";
  else if (len < 150) q.type = "Short";
  else q.type = "Long";

  q.questionText = q.questionText.trim();
  q.answer = q.answer.trim();

  return q;
}
