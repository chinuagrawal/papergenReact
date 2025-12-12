// utils/parser.js
module.exports.extractQuestions = (fullText) => {
  // Strategy:
  // - Split by common question numbering patterns: \n\d+\.\s or \nQ\d+\) etc
  // - For each segment, attempt to find "Ans" or "Answer:" after it for short answers.
  // - Detect marks in parentheses e.g., (2), (3)
  const lines = fullText.split(/\r?\n/);
  const text = lines.join('\n');

  // split into candidate questions using regex for numbers at start-of-line
  const parts = text.split(/\n(?=\s*\d+\s*[.)]\s+)/); // splits on lines like "1. " or "1)"
  const questions = [];

  for (const part of parts) {
    // attempt to detect question line and answer part
    // find marks like (2), [2], - 2 marks patterns
    const marksMatch = part.match(/\((\d+)\s*marks?\)|\[(\d+)\s*marks?\]|\b(\d+)\s*marks?\b/);
    let marks = marksMatch ? (marksMatch[1] || marksMatch[2] || marksMatch[3]) : null;
    if (marks) marks = parseInt(marks, 10);

    // try to split by "Answer:" or "Ans:" or "Solution:" or "Sol."
    const ansSplit = part.split(/\bAnswer:|\bAns:|\bSolution:|\bSol\./i);
    const qtxt = (ansSplit[0] || '').trim();
    const atxt = ansSplit[1] ? ansSplit[1].trim() : null;

    // detect MCQ by options pattern (a) (b) or A. B.
    const isMcq = /\n\s*\(?[a-d]\)?\s*[).-]\s+/.test(qtxt) || /Option[s]?:/i.test(qtxt);

    // quick length-based filter: ignore very short chunks
    if (!qtxt || qtxt.length < 10) continue;

    questions.push({
      questionText: qtxt,
      answerText: atxt,
      marks: marks || null,
      qtype: isMcq ? 'MCQ' : (atxt ? 'Short' : 'Long'),
      pageNum: null, // we'll map pageNum later using layout blocks
      bbox: null
    });
  }
  return questions;
};
