// server/createTables.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION,
});

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(20),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  filename TEXT,
  gcs_uri TEXT,
  mime_type TEXT,
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  question_text TEXT,
  marks INTEGER,
  qtype VARCHAR(20),
  page_num INTEGER,
  bbox JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question_images (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  gcs_uri TEXT,
  caption TEXT
);
`;

(async () => {
  const client = await pool.connect();
  try {
    console.log('Running migrations on:', process.env.PG_CONNECTION ? 'PG_CONNECTION (ok)' : 'NO PG_CONNECTION');
    await client.query(sql);
    console.log('Tables created (or already existed).');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
