const BASE_API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = `${BASE_API}/api/admin`;

export const api = {
  getBoards: () => fetch(`${API}/boards`).then(r => {
    if (!r.ok) throw new Error(`Failed to fetch boards: ${r.status}`);
    return r.json();
  }),
  addBoard: (name) =>
    fetch(`${API}/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then(r => {
      if (!r.ok) throw new Error(`Failed to add board: ${r.status}`);
      return r.json();
    }),

  getClasses: (boardId) =>
    fetch(`${API}/classes?boardId=${boardId}`).then(r => {
      if (!r.ok) throw new Error(`Failed to fetch classes: ${r.status}`);
      return r.json();
    }),
  addClass: (boardId, className) =>
    fetch(`${API}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, className }),
    }).then(r => {
      if (!r.ok) throw new Error(`Failed to add class: ${r.status}`);
      return r.json();
    }),

  getSubjects: (classId) =>
    fetch(`${API}/subjects?classId=${classId}`).then(r => {
      if (!r.ok) throw new Error(`Failed to fetch subjects: ${r.status}`);
      return r.json();
    }),
  addSubject: (classId, name) =>
    fetch(`${API}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, name }),
    }).then(r => {
      if (!r.ok) throw new Error(`Failed to add subject: ${r.status}`);
      return r.json();
    }),

  getBooks: (subjectId) =>
    fetch(`${API}/books?subjectId=${subjectId}`).then(r => {
      if (!r.ok) throw new Error(`Failed to fetch books: ${r.status}`);
      return r.json();
    }),
  addBook: (subjectId, name) =>
    fetch(`${API}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId, name }),
    }).then(r => {
      if (!r.ok) throw new Error(`Failed to add book: ${r.status}`);
      return r.json();
    }),

  getChapters: (bookId) =>
    fetch(`${API}/chapters?bookId=${bookId}`).then(r => {
      if (!r.ok) throw new Error(`Failed to fetch chapters: ${r.status}`);
      return r.json();
    }),
  addChapter: (bookId, chapterNumber, name) =>
    fetch(`${API}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, chapterNumber, name }),
    }).then(r => {
      if (!r.ok) throw new Error(`Failed to add chapter: ${r.status}`);
      return r.json();
    }),
};
