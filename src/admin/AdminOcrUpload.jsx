import { useEffect, useState } from "react";
import { api } from "../services/masterDataApi";
import { useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminOcrUpload() {
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [boardId, setBoardId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [bookId, setBookId] = useState("");
  const [chapterId, setChapterId] = useState("");

  

const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getBoards().then(setBoards);
  }, []);

  useEffect(() => {
    if (boardId) api.getClasses(boardId).then(setClasses);
    setClassId(""); setSubjectId(""); setBookId(""); setChapterId("");
  }, [boardId]);

  useEffect(() => {
    if (classId) api.getSubjects(classId).then(setSubjects);
    setSubjectId(""); setBookId(""); setChapterId("");
  }, [classId]);

  useEffect(() => {
    if (subjectId) api.getBooks(subjectId).then(setBooks);
    setBookId(""); setChapterId("");
  }, [subjectId]);

  useEffect(() => {
    if (bookId) api.getChapters(bookId).then(setChapters);
    setChapterId("");
  }, [bookId]);

  const uploadPdf = async () => {
  const file = fileRef.current?.files?.[0];

  if (!chapterId || !file) {
    alert("Select chapter and PDF");
    return;
  }

  const formData = new FormData();
  formData.append("chapterId", chapterId);
  formData.append("pdf", file);

  try {
    const res = await fetch(`${API}/upload-chapter-pdf`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setMessage(`✅ OCR started (Job ID: ${data.ocrJobId})`);
  } catch (err) {
    setMessage("Upload failed");
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Admin – OCR Upload</h2>

      <select value={boardId} onChange={e => setBoardId(e.target.value)}>
        <option value="">Board</option>
        {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <select value={classId} onChange={e => setClassId(e.target.value)}>
        <option value="">Class</option>
        {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
      </select>

      <select value={subjectId} onChange={e => setSubjectId(e.target.value)}>
        <option value="">Subject</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <select value={bookId} onChange={e => setBookId(e.target.value)}>
        <option value="">Book</option>
        {books.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <select value={chapterId} onChange={e => setChapterId(e.target.value)}>
        <option value="">Chapter</option>
        {chapters.map(ch => (
          <option key={ch.id} value={ch.id}>
            {ch.chapter_number}. {ch.name}
          </option>
        ))}
      </select>

      <div style={{ marginTop: 10 }}>
       <input
  type="file"
  accept="application/pdf"
  ref={fileRef}
/>
      </div>

      <button onClick={uploadPdf} disabled={loading}>
        {loading ? "Uploading..." : "Upload & Start OCR"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
