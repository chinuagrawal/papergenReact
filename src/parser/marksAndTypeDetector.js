/**
 * Marks and Question Type Detector
 */

export function detectMarksAndType(questions) {
  return questions.map(q => {
    const updated = { ...q };

    // 1️⃣ Detect marks
    updated.marks = extractMarks(updated.questionText);

    // 2️⃣ Detect question type
    updated.type = detectQuestionType(updated);

    // 3️⃣ Difficulty hint
    updated.difficulty = detectDifficulty(updated);

    // Cleanup marks from question text
    if (updated.marks) {
      updated.questionText = removeMarksText(updated.questionText);
    }

    return updated;
  });
}
function extractMarks(text = "") {
  const patterns = [
    /\((\d+)\s*m\)/i,
    /\((\d+)\s*marks?\)/i,
    /\[(\d+)\s*m\]/i,
    /-\s*(\d+)\s*m/i
  ];

  for (const p of patterns) {
    const match = text.match(p);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}function detectQuestionType(q) {
  // MCQ
  if (isMCQ(q)) return "MCQ";

  // Numerical
  if (isNumerical(q)) return "Numerical";

  // Structured (sub-questions)
  if (q.subQuestions && q.subQuestions.length > 0) {
    return "Structured";
  }

  // Length-based
  const len = q.questionText.length;

  if (len < 60) return "Very Short";
  if (len < 120) return "Short";
  return "Long";
}
function isMCQ(q) {
  const optionPattern = /\([a-d]\)|[A-D]\./i;
  return optionPattern.test(q.questionText);
}
function isNumerical(q) {
  const combinedText =
    q.questionText + " " + (q.answer || "");

  return /\d+[\d\s]*[+\-×x*/=]/.test(combinedText);
}
function detectDifficulty(q) {
  if (q.marks >= 5) return "Hard";
  if (q.marks >= 3) return "Medium";

  if (q.type === "Numerical") return "Medium";
  if (q.type === "Very Short") return "Easy";

  return "Medium";
}
function removeMarksText(text = "") {
  return text
    .replace(/\(\d+\s*(m|marks?)\)/i, "")
    .replace(/\[\d+\s*m\]/i, "")
    .replace(/-\s*\d+\s*m/i, "")
    .replace(/\s+/g, " ")
    .trim();
}
