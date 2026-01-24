import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------- PROMPT BUILDER ---------------- */

function buildPrompt(pageNumber, blocks) {
  const textWithNewlines = blocks
    .map(b => b.text)
    .join("\n");

  return `
You are a CBSE exam paper extraction expert. Extract questions and answers with STRICT separation.

CRITICAL RULES (MUST FOLLOW):

1. QUESTION TEXT SEPARATION:
   - questionText MUST contain ONLY the question, NEVER the answer
   - If you see "Ans.", "Answer:", "Solution:" or similar markers, STOP at that point
   - NEVER include answer content in questionText field
   - Remove question numbers from questionText (e.g., "1. " or "Q1 " at the start)

2. ANSWER EXTRACTION:
   - Extract answer text that appears AFTER "Ans.", "Answer:", "Solution:" markers
   - If no answer is present, leave answer field as empty string ""
   - Include the complete answer text, preserving line breaks

3. QUESTION NUMBERING:
   - Extract question numbers from patterns like "1.", "2)", "Q3", "44."
   - Questions should be numbered sequentially: 1, 2, 3, 4...
   - Maintain EXACT order as they appear in the text
   - If a question has no number, infer it from sequence

4. QUESTION STRUCTURE:
   - INCLUDE all sub-parts like (a), (b), (i), (ii) INSIDE the questionText
   - PRESERVE line breaks (\\n) in both questionText and answer
   - DO NOT merge separate questions into one
   - DO NOT split one question into multiple

5. METADATA EXTRACTION:
   - Extract marks from patterns like "(2 marks)", "[3]", "5 marks"
   - Extract year if mentioned (e.g., "2023", "2021")
   - Determine type: MCQ (has options a/b/c/d), Short (3 marks), Long (5+ marks), Assertion, etc.

6. ORDERING:
   - Questions MUST be in sequential order (1, 2, 3, 4... not 10, 11, 8, 9)
   - Sort by question number, not by appearance position

OUTPUT FORMAT (STRICT JSON, no markdown):

{
  "questions": [
    {
      "questionNumber": number (extracted from question, e.g., 1, 2, 44),
      "questionText": "Only the question text, no answer, no 'Ans.' prefix, no question number",
      "answer": "Only the answer text, no 'Ans.' prefix",
      "marks": number or null,
      "type": "MCQ | Short | Long | Numerical | Assertion | Fill | CaseStudy | Other",
      "year": number or null,
      "confidence": 0.0 to 1.0
    }
  ]
}

EXAMPLES:

Input: "1. What is nationalism? Ans. Nationalism is..."
Output: {
  "questionNumber": 1,
  "questionText": "What is nationalism?",
  "answer": "Nationalism is...",
  "marks": null,
  "type": "Short",
  "year": null,
  "confidence": 0.9
}

Input: "44. Explain conditions. Ans. The conditions were..."
Output: {
  "questionNumber": 44,
  "questionText": "Explain conditions.",
  "answer": "The conditions were...",
  "marks": null,
  "type": "Long",
  "year": null,
  "confidence": 0.9
}

Page number: ${pageNumber}

TEXT TO PROCESS:
"""
${textWithNewlines}
"""
`;
}

/* ---------------- JSON CLEANER ---------------- */

function cleanJson(text) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

/* ---------------- AI SEGMENTER ---------------- */

export async function segmentQuestionsAI(pageNumber, blocks) {
  const prompt = buildPrompt(pageNumber, blocks);

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { 
        role: "system", 
        content: "You are an expert at extracting CBSE exam questions. You MUST separate questions from answers. NEVER include 'Ans.' or answer text in questionText. Always maintain sequential question numbering (1, 2, 3...)." 
      },
      { role: "user", content: prompt }
    ],
  });

  const rawText = completion.choices[0].message.content;
  const cleaned = cleanJson(rawText);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ AI returned invalid JSON:\n", cleaned);
    throw new Error("AI JSON parse failed");
  }

  // 🔒 HARD GUARANTEE (this fixes your crash)
  if (!parsed || !Array.isArray(parsed.questions)) {
    console.error("❌ Invalid AI format:", parsed);
    throw new Error("AI response missing questions array");
  }

  // 🔒 NORMALIZE OUTPUT (prevents undefined errors later)
  return parsed.questions.map((q, index) => {
    // Clean questionText - remove any remaining "Ans." markers
    let questionText = (q.questionText || "").trim();
    questionText = questionText.replace(/\s+Ans\.?\s*.*$/i, "").trim();
    
    // Clean answer - remove "Ans." prefix
    let answer = (q.answer || "").trim();
    answer = answer.replace(/^Ans\.?\s*/i, "").trim();
    
    // Extract question number if present in questionText
    let questionNumber = q.questionNumber || null;
    if (!questionNumber) {
      const numMatch = questionText.match(/^(\d+)[\.\)\:\-]\s*/);
      if (numMatch) {
        questionNumber = parseInt(numMatch[1], 10);
        // Remove number from questionText
        questionText = questionText.replace(/^\d+[\.\)\:\-]\s*/, "").trim();
      }
    }
    
    return {
      questionText,
      answer,
      marks: q.marks ?? null,
      type: q.type || "Other",
      year: q.year ?? null,
      confidence: q.confidence ?? 0.5,
      questionNumber: questionNumber || (index + 1), // Fallback to index if no number
    };
  });
}
