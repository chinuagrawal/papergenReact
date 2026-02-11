import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/masterDataApi";

export default function AdminMasterData() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [boardId, setBoardId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [bookId, setBookId] = useState("");

  const [boardName, setBoardName] = useState("");
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [bookName, setBookName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");

  // ---------- LOAD BOARDS ----------
  useEffect(() => {
    api.getBoards().then(setBoards);
  }, []);

  // ---------- LOAD CLASSES ----------
  useEffect(() => {
    if (boardId) {
      api.getClasses(boardId).then(setClasses);
    } else {
      setClasses([]);
    }
    setClassId("");
    setSubjectId("");
    setBookId("");
  }, [boardId]);

  // ---------- LOAD SUBJECTS ----------
  useEffect(() => {
    if (classId) {
      api.getSubjects(classId).then(setSubjects);
    } else {
      setSubjects([]);
    }
    setSubjectId("");
    setBookId("");
  }, [classId]);

  // ---------- LOAD BOOKS ----------
  useEffect(() => {
    if (subjectId) {
      api.getBooks(subjectId).then(setBooks);
    } else {
      setBooks([]);
    }
    setBookId("");
  }, [subjectId]);

  // ---------- LOAD CHAPTERS ----------
  useEffect(() => {
    if (bookId) {
      api.getChapters(bookId).then(setChapters);
    } else {
      setChapters([]);
    }
  }, [bookId]);

  return (
    <div style={{ padding: 20, maxWidth: 800 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>Admin – Master Data (Syllabus)</h2>
        <button
          onClick={() => navigate("/admin/ocr-upload")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Go to PDF Upload
        </button>
      </div>

      {/* ---------------- BOARD ---------------- */}
      <h3>Board</h3>
      <select value={boardId} onChange={(e) => setBoardId(e.target.value)}>
        <option value="">Select Board</option>
        {boards.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <div>
        <input
          placeholder="New board name"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
        />
        <button
          onClick={async () => {
            await api.addBoard(boardName);
            setBoardName("");
            setBoards(await api.getBoards());
          }}
        >
          Add Board
        </button>
      </div>

      {/* ---------------- CLASS ---------------- */}
      {boardId && (
        <>
          <h3>Class</h3>
          <select value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </select>

          <div>
            <input
              placeholder="New class (e.g. 9)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
            <button
              onClick={async () => {
                await api.addClass(boardId, className);
                setClassName("");
                setClasses(await api.getClasses(boardId));
              }}
            >
              Add Class
            </button>
          </div>
        </>
      )}

      {/* ---------------- SUBJECT ---------------- */}
      {classId && (
        <>
          <h3>Subject</h3>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div>
            <input
              placeholder="New subject"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
            />
            <button
              onClick={async () => {
                await api.addSubject(classId, subjectName);
                setSubjectName("");
                setSubjects(await api.getSubjects(classId));
              }}
            >
              Add Subject
            </button>
          </div>
        </>
      )}

      {/* ---------------- BOOK ---------------- */}
      {subjectId && (
        <>
          <h3>Book</h3>
          <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
            <option value="">Select Book</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div>
            <input
              placeholder="New book"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
            />
            <button
              onClick={async () => {
                await api.addBook(subjectId, bookName);
                setBookName("");
                setBooks(await api.getBooks(subjectId));
              }}
            >
              Add Book
            </button>
          </div>
        </>
      )}

      {/* ---------------- CHAPTER ---------------- */}
      {bookId && (
        <>
          <h3>Chapter</h3>

          <ul>
            {chapters.map((ch) => (
              <li key={ch.id}>
                {ch.chapter_number}. {ch.name}
              </li>
            ))}
          </ul>

          <div>
            <input
              type="number"
              placeholder="Chapter no."
              value={chapterNumber}
              onChange={(e) => setChapterNumber(e.target.value)}
            />
            <input
              placeholder="Chapter name"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
            />
            <button
              onClick={async () => {
                await api.addChapter(bookId, chapterNumber, chapterName);
                setChapterName("");
                setChapterNumber("");
                setChapters(await api.getChapters(bookId));
              }}
            >
              Add Chapter
            </button>
          </div>
        </>
      )}
    </div>
  );
}
