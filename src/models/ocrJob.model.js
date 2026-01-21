import { pool } from "../config/db.js";

/* ---------------- CREATE OCR JOB ---------------- */
export async function createOCRJob(chapterId, pdfUrl) {
  const { rows } = await pool.query(
    `
    INSERT INTO ocr_jobs (chapter_id, pdf_url, status)
    VALUES ($1, $2, 'pending')
    RETURNING *
    `,
    [chapterId, pdfUrl]
  );

  return rows[0];
}

/* ---------------- UPDATE OCR JOB ---------------- */
export async function updateOCRJob(
  id,
  status,
  error = null,
  outputPath = null
) {
  await pool.query(
    `
    UPDATE ocr_jobs
    SET status = $1,
        error = $2,
        output_path = COALESCE($3, output_path),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    `,
    [status, error, outputPath, id]
  );
}

/* ---------------- GET OCR JOB BY ID ---------------- */
export async function getOCRJobById(id) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM ocr_jobs
    WHERE id = $1
    `,
    [id]
  );

  return rows[0];
}
