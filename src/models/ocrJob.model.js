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

export async function updateOCRJob(id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setClause = keys
    .map((k, i) => `${k} = $${i + 1}`)
    .join(", ");

  await pool.query(
    `UPDATE ocr_jobs
     SET ${setClause}, updated_at = NOW()
     WHERE id = $${keys.length + 1}`,
    [...values, id]
  );
}

export async function getOCRJob(id) {
  const { rows } = await pool.query(
    `SELECT * FROM ocr_jobs WHERE id = $1`,
    [id]
  );
  return rows[0];
}
