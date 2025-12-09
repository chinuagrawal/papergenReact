// server/utils/parser.js
// improved heuristic Q/A extractor

function detectMarksFromLine(line) {
  if (!line) return null;
  // Normalize spaces
  const s = line.replace(/\s+/g, ' ').trim();

  // Try common patterns:
  // (2), [2], 2 marks, marks: 2, - 2, — 2 (at end or near end)
  // Also accept single or two-digit numbers
  const patterns = [
    /\(?\b(\d{1,2})\b\)?\s*marks?$/i,         // "... (2) marks" or "... 2 marks"
    /marks?\s*[:\-]?\s*(\d{1,2})\b$/i,        // "marks: 2" or "marks - 2"
    /[:\-\—]\s*(\d{1,2})\s*marks?$/i,         // " - 2 marks"
    /(?:\(|\[)\s*(\d{1,2})\s*(?:\)|\])\s*$/i, // "(2)" or "[2]" at end
    /\b(\d{1,2})\b\s*$/                       // just a number at end
  ];

  for (const re of patterns) {
    const m = s.match(re);
    if (m) return parseInt(m[1], 10);
  }

  // if nothing matched, try to find any "x marks" anywhere
  const anywhere = s.match(/\b(\d{1,2})\b\s*marks?\b/i);
  if (anywhere) return parseInt(anywhere[1], 10);

  return null;
}

function estimateMarksByLength(text) {
  if (!text) return 1;
  const len = text.replace(/\s+/g, ' ').trim().length;
  if (len < 60) return 1;
  if (len < 200) return 2;
  if (len < 450) return 4;
  return 8;
}

function splitIntoCandidates(text) {
  if (!text) return [];
  // normalize whitespace and line endings
  const normal = text.replace(/\r/g, '').replace(/\t/g, ' ').replace(/\u00A0/g, ' ').trim();
  const lines = normal.split('\n').map(l => l.trim());

  // join continued short lines that belong to same paragraph:
  const paras = [];
  let cur = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      if (cur.length) { paras.push(cur.join(' ')); cur = []; }
      continue;
    }

    // If the line ends with a hyphen, join without the hyphen (word continuation)
    if (line.endsWith('-') && i + 1 < lines.length) {
      cur.push(line.slice(0, -1));
      continue;
    }

    // Heuristic: if line is short (<40) and next line starts lowercase, join (likely same sentence)
    const next = lines[i + 1] || '';
    if (line.length < 40 && next && /^[a-z]/.test(next)) {
      cur.push(line + ' ');
      continue;
    }

    cur.push(line);

    // If next line is empty or next line looks like a numbered heading, flush
    const nextIsNum = next.match(/^\s*(?:Q\s*|Question\s*)?(?:\(?\d{1,3}\)?[\.\)]?)/i);
    if (!next || nextIsNum) {
      paras.push(cur.join(' ').trim());
      cur = [];
    }
  }
  if (cur.length) paras.push(cur.join(' ').trim());
  return paras;
}

function splitByLeadingNumber(paras) {
  const questions = [];
  let buffer = null;

  const headingRe = /^\s*(?:Q\s*|Question\s*)?(?:\(?)(\d{1,3})(?:[\.\)]\s+|\s+-\s+|\s+)/i;

  for (const p of paras) {
    const m = p.match(headingRe);
    if (m) {
      // start a new question buffer
      if (buffer) questions.push(buffer.trim());
      // remove the leading number token
      const stripped = p.replace(headingRe, '').trim();
      buffer = stripped || '';
    } else {
      // continuation or standalone paragraph
      if (buffer !== null) {
        buffer += ' ' + p;
      } else {
        // push as-is (standalone paragraph that wasn't numbered)
        questions.push(p);
      }
    }
  }
  if (buffer) questions.push(buffer.trim());
  return questions;
}

function detectMCQ(qtext) {
  if (!qtext) return false;
  // look for option markers or inline options
  // examples: "(a) ... (b) ...", "a) b) c)", "A. B. C.", "Options: a, b, c"
  if (/\(\s*[a-d]\s*\)/i.test(qtext)) return true;
  if (/\b[a-d]\)\s+/i.test(qtext)) return true;
  if (/\b[A-D]\.\s+/i.test(qtext)) return true;
  if (/options?\s*[:\-]/i.test(qtext)) return true;
  // inline options like "a) ... b) ... c)" or "i) ii) iii)"
  if (/[a-d]\)\s+[^]+[a-d]\)/i.test(qtext)) return true;
  return false;
}

function extractQuestions(text) {
  const paras = splitIntoCandidates(text);
  const candidates = splitByLeadingNumber(paras);
  const result = [];

  for (const cand of candidates) {
    let qtext = (cand || '').trim();
    if (!qtext) continue;

    // Try detect marks from the last part of the text first
    let marks = detectMarksFromLine(qtext);

    // if marks detected, remove that trailing marks token from question text
    if (marks !== null) {
      qtext = qtext.replace(/(?:\(|\[)?\b\d{1,2}\b(?:\)|\])?(?:\s*marks?)?$/i, '').trim();
    } else {
      marks = estimateMarksByLength(qtext);
    }

    // determine qtype
    let qtype = 'short';
    if (qtext.length > 300) qtype = 'long';
    if (detectMCQ(qtext)) qtype = 'mcq';

    // produce both camelCase and snake_case keys for compatibility
    result.push({
      questionText: qtext,
      question_text: qtext,
      marks,
      qtype
    });
  }

  return result;
}

module.exports = { extractQuestions, detectMarksFromLine, estimateMarksByLength };
