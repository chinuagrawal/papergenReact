import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanJson(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function segmentQuestionsAI(pageNumber, blocks) {
  const text = blocks.map(b => b.text).join("\n");

  const prompt = `
You are an expert CBSE exam paper parser.

Return ONLY valid JSON.
Do NOT wrap response in markdown.
Do NOT add explanation.

FORMAT:
[
  {
    "questionText": "...",
    "answer": "...",
    "confidence": 0.0
  }
]

TEXT:
"""
${text}
"""
`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0].message.content;
  const cleaned = cleanJson(raw);

  return JSON.parse(cleaned);
}
