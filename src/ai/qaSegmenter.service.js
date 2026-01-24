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
You are a CBSE exam paper expert.

Rules (VERY IMPORTANT):
- Identify questions EXACTLY as they appear
- DO NOT remove sub-parts like (a), (b), (i), (ii)
- INCLUDE sub-parts inside the SAME questionText
- PRESERVE original order
- PRESERVE line breaks (\\n)
- DO NOT merge or shuffle questions
- DO NOT invent missing text
- If unsure, keep the text unchanged

Return STRICT JSON ONLY (no markdown, no explanation):

{
  "questions": [
    {
      "questionText": "string",
      "answer": "string",
      "marks": number | null,
      "type": "MCQ | Short | Long | Numerical | Assertion | Fill | CaseStudy | Other",
      "year": number | null,
      "confidence": number
    }
  ]
}

Page number: ${pageNumber}

TEXT:
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
      { role: "system", content: "You extract structured exam questions." },
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
  return parsed.questions.map(q => ({
    questionText: q.questionText || "",
    answer: q.answer || "",
    marks: q.marks ?? null,
    type: q.type || "Other",
    year: q.year ?? null,
    confidence: q.confidence ?? 0.5,
  }));
}
