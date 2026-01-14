import { pool } from "../config/db.js";

export async function getQuestionsByChapter(req, res) {
  const { chapterId } = req.params;

  try {
    const questionsRes = await pool.query(
      `
      SELECT * FROM questions
      WHERE chapter_id = $1
      ORDER BY id
      `,
      [chapterId]
    );

    const questions = questionsRes.rows;

    for (const q of questions) {
      const subRes = await pool.query(
        `SELECT * FROM sub_questions WHERE question_id = $1`,
        [q.id]
      );
      q.subQuestions = subRes.rows;
    }

    res.json({ success: true, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
}
