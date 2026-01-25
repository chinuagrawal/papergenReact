import { pool } from "../config/db.js";

/**
 * Save extracted questions (NO sub-questions)
 */
export async function saveQuestions({ chapterId, ocrJobId, questions }) {
  const client = await pool.connect();
  // Handle connection errors during transaction
  client.on("error", (err) => {
    console.error(
      "Database client error during saveQuestions transaction:",
      err,
    );
  });

  try {
    await client.query("BEGIN");

    // 🧹 Clean up previous save for this job to avoid duplicates
    await client.query("DELETE FROM questions WHERE ocr_job_id = $1", [
      ocrJobId,
    ]);

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
          answer_text,
          question_image,
          answer_image
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `,
        [
          chapterId,
          ocrJobId,
          q.questionNumber,
          q.questionText,
          q.marks,
          q.type,
          q.difficulty,
          q.answer || null,
          q.questionImage || null,
          q.answerImage || null,
        ],
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
