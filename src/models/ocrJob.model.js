import { pool } from "../config/db.js";


export async function createOCRJob(chapterId, pdfUrl) {
  const { rows } = await pool.query(
    `INSERT INTO ocr_jobs (chapter_id, pdf_url, status)
     VALUES ($1, $2, 'pending')
     RETURNING *`,
    [chapterId, pdfUrl]
  );

  return rows[0];
}

export async function updateOCRJob(id, status, error = null) {
  await pool.query(
    `UPDATE ocr_jobs
     SET status = $1, error_message = $2
     WHERE id = $3`,
    [status, error, id]
  );
}
