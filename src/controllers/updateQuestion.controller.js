import { pool } from "../config/db.js";

export async function updateQuestion(req, res) {
  const { id } = req.params;
  const {
    questionText,
    answerText,
    marks,
    difficulty,
    questionType
  } = req.body;

  try {
    await pool.query(
      `
      UPDATE questions
      SET
        question_text = $1,
        answer_text = $2,
        marks = $3,
        difficulty = $4,
        question_type = $5
      WHERE id = $6
      `,
      [
        questionText,
        answerText,
        marks,
        difficulty,
        questionType,
        id
      ]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
}
