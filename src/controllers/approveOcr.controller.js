import { pool } from "../config/db.js";

export async function approveOcrJob(req, res) {
  const { ocrJobId } = req.body;

  try {
    await pool.query(
      `
      UPDATE ocr_jobs
      SET status = 'completed'
      WHERE id = $1
      `,
      [ocrJobId]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
}
