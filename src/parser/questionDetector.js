/**
 * Question Detection Engine
 * Input: normalized text blocks
 * Output: structured questions with answers
 */

export function detectQuestions(blocks) {
  const questions = [];
  let currentQuestion = null;
  let collectingAnswer = false;

  for (const block of blocks) {
    const text = block.text.trim();

    if (isInstruction(text)) continue;

    // 🔹 New main question
    const qMatch = matchMainQuestion(text);
    if (qMatch) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      currentQuestion = {
        questionNumber: qMatch.number,
        questionText: qMatch.text,
        subQuestions: [],
        answer: "",
        marks: null,
        type: null,
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

    // 🔹 Sub-question
    const subQ = matchSubQuestion(text);
    if (subQ && currentQuestion) {
      currentQuestion.subQuestions.push({
        label: subQ.label,
        text: subQ.text,
      });
      continue;
    }

    // 🔹 Append text
    if (currentQuestion) {
      if (collectingAnswer) {
        currentQuestion.answer += " " + text;
      } else {
        currentQuestion.questionText += " " + text;
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions.map(enrichQuestion);
}
function matchMainQuestion(text) {
  const patterns = [
    /^(\d+)[\.\)\:\-]\s*(.+)/,   // 1. Question
    /^Q(\d+)\s*(.+)/i           // Q1 Question
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        number: match[1],
        text: match[2],
      };
    }
  }

  return null;
}
function matchSubQuestion(text) {
  const patterns = [
    /^\(?([a-z])\)\s*(.+)/i,     // (a)
    /^([a-z])\)\s*(.+)/i,        // a)
    /^\(?([ivx]+)\)\s*(.+)/i,    // (i)
    /^([ivx]+)\.\s*(.+)/i        // i.
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        label: match[1],
        text: match[2],
      };
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
  const keywords = [
    "answer the following",
    "do as directed",
    "time:",
    "total marks",
    "instructions",
  ];

  return keywords.some(k => text.toLowerCase().includes(k));
}
function enrichQuestion(q) {
  const len = q.questionText.length;

  if (q.subQuestions.length > 0) {
    q.type = "Structured";
  } else if (len < 80) {
    q.type = "Very Short";
  } else if (len < 150) {
    q.type = "Short";
  } else {
    q.type = "Long";
  }

  q.answer = q.answer.trim();
  q.questionText = q.questionText.trim();

  return q;
}
