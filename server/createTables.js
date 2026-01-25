// server/createTables.js
import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading from root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { Pool } = pg;

const connectionString = process.env.PG_CONNECTION || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ CRITICAL: No PG_CONNECTION or DATABASE_URL found in env!");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Neon/some remote DBs
  },
});

// Handle idle client errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client (createTables)", err);
});

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(20),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT now(),
  verified BOOLEAN DEFAULT false
);

-- Ensure columns exist if table was created previously
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50);

CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(20),
  otp VARCHAR(10),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  filename TEXT,
  gcs_uri TEXT,
  mime_type TEXT,
  status VARCHAR(20) DEFAULT 'uploaded',
  uploaded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  chapter_id INTEGER,
  ocr_job_id TEXT,
  question_number INTEGER,
  question_text TEXT,
  marks INTEGER,
  qtype VARCHAR(20),
  question_type VARCHAR(20),
  difficulty VARCHAR(20),
  answer_text TEXT,
  page_num INTEGER,
  bbox JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Ensure columns exist for questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS qtype VARCHAR(20);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type VARCHAR(20);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS chapter_id INTEGER;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_image TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer_image TEXT;

CREATE TABLE IF NOT EXISTS question_images (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  gcs_uri TEXT,
  caption TEXT
);
`;

(async () => {
  const client = await pool.connect();
  client.on("error", (err) => {
    console.error("Database client error during migration:", err);
  });

  try {
    console.log(
      "Running migrations on:",
      process.env.PG_CONNECTION ? "PG_CONNECTION (ok)" : "NO PG_CONNECTION",
    );
    await client.query(sql);
    console.log("Tables created (or already existed).");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
