import { pool } from "../config/db.js";

/* ---------- BOARDS ---------- */
export async function addBoard(req, res) {
  const { name } = req.body;
  const result = await pool.query(
    "INSERT INTO boards(name) VALUES($1) RETURNING *",
    [name]
  );
  res.json(result.rows[0]);
}

export async function getBoards(req, res) {
  const result = await pool.query("SELECT * FROM boards ORDER BY id");
  res.json(result.rows);
}

/* ---------- CLASSES ---------- */
export async function addClass(req, res) {
  const { boardId, className } = req.body;
  const result = await pool.query(
    "INSERT INTO classes(board_id, class_name) VALUES($1,$2) RETURNING *",
    [boardId, className]
  );
  res.json(result.rows[0]);
}

export async function getClasses(req, res) {
  const { boardId } = req.query;
  const result = await pool.query(
    "SELECT * FROM classes WHERE board_id=$1 ORDER BY id",
    [boardId]
  );
  res.json(result.rows);
}

/* ---------- SUBJECTS ---------- */
export async function addSubject(req, res) {
  const { classId, name } = req.body;
  const result = await pool.query(
    "INSERT INTO subjects(class_id, name) VALUES($1,$2) RETURNING *",
    [classId, name]
  );
  res.json(result.rows[0]);
}

export async function getSubjects(req, res) {
  const { classId } = req.query;
  const result = await pool.query(
    "SELECT * FROM subjects WHERE class_id=$1 ORDER BY id",
    [classId]
  );
  res.json(result.rows);
}

/* ---------- BOOKS ---------- */
export async function addBook(req, res) {
  const { subjectId, name } = req.body;
  const result = await pool.query(
    "INSERT INTO books(subject_id, name) VALUES($1,$2) RETURNING *",
    [subjectId, name]
  );
  res.json(result.rows[0]);
}

export async function getBooks(req, res) {
  const { subjectId } = req.query;
  const result = await pool.query(
    "SELECT * FROM books WHERE subject_id=$1 ORDER BY id",
    [subjectId]
  );
  res.json(result.rows);
}

/* ---------- CHAPTERS ---------- */
export async function addChapter(req, res) {
  const { bookId, chapterNumber, name } = req.body;
  const result = await pool.query(
    "INSERT INTO chapters(book_id, chapter_number, name) VALUES($1,$2,$3) RETURNING *",
    [bookId, chapterNumber, name]
  );
  res.json(result.rows[0]);
}

export async function getChapters(req, res) {
  const { bookId } = req.query;
  const result = await pool.query(
    "SELECT * FROM chapters WHERE book_id=$1 ORDER BY chapter_number",
    [bookId]
  );
  res.json(result.rows);
}
