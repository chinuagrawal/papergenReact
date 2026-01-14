import { pool } from "../config/db.js";

/**
 * Save extracted questions into PostgreSQL
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
      const res = await client.query(
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
        RETURNING id
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

      const questionId = res.rows[0].id;

      // 🔹 Insert sub-questions
      for (const sq of q.subQuestions || []) {
        await client.query(
          `
          INSERT INTO sub_questions (
            question_id,
            label,
            sub_question_text,
            sub_answer_text
          )
          VALUES ($1,$2,$3,$4)
          `,
          [
            questionId,
            sq.label,
            sq.text,
            sq.answer || null
          ]
        );
      }
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
