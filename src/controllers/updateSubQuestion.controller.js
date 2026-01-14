import { pool } from "../config/db.js";

export async function updateSubQuestion(req, res) {
  const { id } = req.params;
  const {
    subQuestionText,
    subAnswerText
  } = req.body;

  try {
    await pool.query(
      `
      UPDATE sub_questions
      SET
        sub_question_text = $1,
        sub_answer_text = $2
      WHERE id = $3
      `,
      [subQuestionText, subAnswerText, id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
}
