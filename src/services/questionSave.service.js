import { pool } from "../config/db.js";

/**
 * Save extracted questions (NO sub-questions)
 */
export async function saveQuestions({
  chapterId,
  ocrJobId,
  questions
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const q of questions) {
      await client.query(
        `
        INSERT INTO questions (
          chapter_id,
          ocr_job_id,
          question_number,
          question_text,
          marks,
          question_type,
          difficulty,
          answer_text
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [
          chapterId,
          ocrJobId,
          q.questionNumber,
          q.questionText,
          q.marks,
          q.type,
          q.difficulty,
          q.answer || null
        ]
      );
    }

    await client.query("COMMIT");
    return { success: true };

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ DB SAVE FAILED:", err);
    throw err;
  } finally {
    client.release();
  }
}
