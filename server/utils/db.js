// server/utils/db.js
// PostgreSQL helper (CommonJS)

const { Pool } = require('pg');

if (!process.env.PG_CONNECTION) {
  console.warn('PG_CONNECTION not set in .env. DB calls will fail until you set it.');
}

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION,
  // optional: increase idle timeout / connection limits for production
  // max: 20,
  // idleTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client (utils/db)', err);
});

async function insertDocument({ userId = null, filename, gcsUri, mimeType = null }) {
  const q = `INSERT INTO documents (user_id, filename, gcs_uri, mime_type)
             VALUES ($1,$2,$3,$4) RETURNING *`;
  const values = [userId, filename, gcsUri, mimeType];
  const res = await pool.query(q, values);
  return res.rows[0];
}

async function insertQuestion({ documentId, questionText, marks = null, qtype = null, pageNum = null, bbox = null }) {
  const q = `INSERT INTO questions (document_id, question_text, marks, qtype, page_num, bbox)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const values = [documentId, questionText, marks, qtype, pageNum, bbox];
  const res = await pool.query(q, values);
  return res.rows[0];
}

async function insertQuestionImage({ questionId = null, gcsUri, caption = null }) {
  const q = `INSERT INTO question_images (question_id, gcs_uri, caption)
             VALUES ($1,$2,$3) RETURNING *`;
  const values = [questionId, gcsUri, caption];
  const res = await pool.query(q, values);
  return res.rows[0];
}

async function getDocumentById(id) {
  const q = `SELECT * FROM documents WHERE id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

async function getQuestionsByDocument(documentId) {
  const q = `SELECT * FROM questions WHERE document_id = $1 ORDER BY id`;
  const res = await pool.query(q, [documentId]);
  return res.rows;
}

module.exports = {
  pool,
  insertDocument,
  insertQuestion,
  insertQuestionImage,
  getDocumentById,
  getQuestionsByDocument
};
