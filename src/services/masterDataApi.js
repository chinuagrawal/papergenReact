const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/admin";

export const api = {
  getBoards: () => fetch(`${API}/boards`).then(r => r.json()),
  addBoard: (name) =>
    fetch(`${API}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }),

  getClasses: (boardId) =>
    fetch(`${API}/classes?boardId=${boardId}`).then(r => r.json()),
  addClass: (boardId, className) =>
    fetch(`${API}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, className }),
    }),

  getSubjects: (classId) =>
    fetch(`${API}/subjects?classId=${classId}`).then(r => r.json()),
  addSubject: (classId, name) =>
    fetch(`${API}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, name }),
    }),

  getBooks: (subjectId) =>
    fetch(`${API}/books?subjectId=${subjectId}`).then(r => r.json()),
  addBook: (subjectId, name) =>
    fetch(`${API}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, name }),
    }),

  getChapters: (bookId) =>
    fetch(`${API}/chapters?bookId=${bookId}`).then(r => r.json()),
  addChapter: (bookId, chapterNumber, name) =>
    fetch(`${API}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, chapterNumber, name }),
    }),
};
