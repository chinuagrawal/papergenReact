import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/masterDataApi";

export default function AdminMasterData() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [boardId, setBoardId] = useState("");
  const [mediumId, setMediumId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [bookId, setBookId] = useState("");

  const [boardName, setBoardName] = useState("");
  const [mediumName, setMediumName] = useState("");
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [bookName, setBookName] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");

  // State to control visibility of add forms
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [showAddMedium, setShowAddMedium] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);

  // ---------- LOAD BOARDS ----------
  useEffect(() => {
    api.getBoards().then(setBoards);
  }, []);

  // ---------- LOAD MEDIUMS ----------
  useEffect(() => {
    if (boardId) {
      api.getMediums(boardId).then(setMediums);
    } else {
      setMediums([]);
    }
    setMediumId("");
    setClassId("");
    setSubjectId("");
    setBookId("");
  }, [boardId]);

  // ---------- LOAD CLASSES ----------
  useEffect(() => {
    if (boardId && mediumId) {
      api.getClasses(boardId, mediumId).then(setClasses);
    } else {
      setClasses([]);
    }
    setClassId("");
    setSubjectId("");
    setBookId("");
  }, [boardId, mediumId]);

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
    <div className="bg-[#f8f9fa] min-h-screen w-full pb-24">
      {/* Top App Bar */}
      <nav className="w-full top-0 sticky bg-white shadow-sm z-50 border-b border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#003d9b] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dataset
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#003d9b] tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Master Data Management
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/ocr-upload")}
            className="bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              upload_file
            </span>
            PDF Upload
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pt-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-[#003d9b] mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl">school</span>
            Syllabus Hierarchy
          </h2>
          <p className="text-slate-600 text-lg">
            Configure the complete academic structure from board to chapters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Board Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-[#003d9b]/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-[#003d9b] text-2xl">
                  domain
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#003d9b]">Board</h3>
                <p className="text-xs text-slate-500">
                  Educational board or council
                </p>
              </div>
              <button
                onClick={() => setShowAddBoard(!showAddBoard)}
                className="flex items-center gap-2 px-4 py-2 bg-[#003d9b]/10 text-[#003d9b] rounded-xl font-semibold hover:bg-[#003d9b]/20 transition-all"
              >
                <span className="material-symbols-outlined text-lg">
                  {showAddBoard ? "close" : "add"}
                </span>
                {showAddBoard ? "Cancel" : "Add"}
              </button>
            </div>
            <select
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/30 focus:border-[#003d9b] transition-all bg-white mb-4"
            >
              <option value="">Select Board</option>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            {showAddBoard && (
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="New board name"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/30 focus:border-[#003d9b] transition-all"
                />
                <button
                  onClick={async () => {
                    await api.addBoard(boardName);
                    setBoardName("");
                    setShowAddBoard(false);
                    setBoards(await api.getBoards());
                  }}
                  className="px-5 py-3 bg-[#003d9b] text-white rounded-xl font-semibold hover:bg-[#002d72] transition-all active:scale-95"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Medium Card */}
          {boardId && (
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-[#7b2600]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#7b2600] text-2xl">
                    language
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#7b2600]">Medium</h3>
                  <p className="text-xs text-slate-500">
                    Language of instruction
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMedium(!showAddMedium)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7b2600]/10 text-[#7b2600] rounded-xl font-semibold hover:bg-[#7b2600]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showAddMedium ? "close" : "add"}
                  </span>
                  {showAddMedium ? "Cancel" : "Add"}
                </button>
              </div>
              <select
                value={mediumId}
                onChange={(e) => setMediumId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7b2600]/30 focus:border-[#7b2600] transition-all bg-white mb-4"
              >
                <option value="">Select Medium</option>
                {mediums.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {showAddMedium && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="New medium (e.g. English)"
                    value={mediumName}
                    onChange={(e) => setMediumName(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7b2600]/30 focus:border-[#7b2600] transition-all"
                  />
                  <button
                    onClick={async () => {
                      await api.addMedium(boardId, mediumName);
                      setMediumName("");
                      setShowAddMedium(false);
                      setMediums(await api.getMediums(boardId));
                    }}
                    className="px-5 py-3 bg-[#7b2600] text-white rounded-xl font-semibold hover:bg-[#5a1c00] transition-all active:scale-95"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Class Card */}
          {boardId && mediumId && (
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-[#003d9b]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#003d9b] text-2xl">
                    group
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#003d9b]">Class</h3>
                  <p className="text-xs text-slate-500">Grade or standard</p>
                </div>
                <button
                  onClick={() => setShowAddClass(!showAddClass)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#003d9b]/10 text-[#003d9b] rounded-xl font-semibold hover:bg-[#003d9b]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showAddClass ? "close" : "add"}
                  </span>
                  {showAddClass ? "Cancel" : "Add"}
                </button>
              </div>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/30 focus:border-[#003d9b] transition-all bg-white mb-4"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
              {showAddClass && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="New class (e.g. 9)"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/30 focus:border-[#003d9b] transition-all"
                  />
                  <button
                    onClick={async () => {
                      await api.addClass(boardId, mediumId, className);
                      setClassName("");
                      setShowAddClass(false);
                      setClasses(await api.getClasses(boardId, mediumId));
                    }}
                    className="px-5 py-3 bg-[#003d9b] text-white rounded-xl font-semibold hover:bg-[#002d72] transition-all active:scale-95"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Subject Card */}
          {classId && (
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-[#7b2600]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#7b2600] text-2xl">
                    menu_book
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#7b2600]">Subject</h3>
                  <p className="text-xs text-slate-500">Academic subject</p>
                </div>
                <button
                  onClick={() => setShowAddSubject(!showAddSubject)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7b2600]/10 text-[#7b2600] rounded-xl font-semibold hover:bg-[#7b2600]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showAddSubject ? "close" : "add"}
                  </span>
                  {showAddSubject ? "Cancel" : "Add"}
                </button>
              </div>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7b2600]/30 focus:border-[#7b2600] transition-all bg-white mb-4"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {showAddSubject && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="New subject"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7b2600]/30 focus:border-[#7b2600] transition-all"
                  />
                  <button
                    onClick={async () => {
                      await api.addSubject(classId, subjectName);
                      setSubjectName("");
                      setShowAddSubject(false);
                      setSubjects(await api.getSubjects(classId));
                    }}
                    className="px-5 py-3 bg-[#7b2600] text-white rounded-xl font-semibold hover:bg-[#5a1c00] transition-all active:scale-95"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Book Card */}
          {subjectId && (
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-[#003d9b]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#003d9b] text-2xl">
                    auto_stories
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#003d9b]">Book</h3>
                  <p className="text-xs text-slate-500">
                    Textbook or reference material
                  </p>
                </div>
                <button
                  onClick={() => setShowAddBook(!showAddBook)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#003d9b]/10 text-[#003d9b] rounded-xl font-semibold hover:bg-[#003d9b]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showAddBook ? "close" : "add"}
                  </span>
                  {showAddBook ? "Cancel" : "Add"}
                </button>
              </div>
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/30 focus:border-[#003d9b] transition-all bg-white mb-4"
              >
                <option value="">Select Book</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {showAddBook && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="New book"
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/30 focus:border-[#003d9b] transition-all"
                  />
                  <button
                    onClick={async () => {
                      await api.addBook(subjectId, bookName);
                      setBookName("");
                      setShowAddBook(false);
                      setBooks(await api.getBooks(subjectId));
                    }}
                    className="px-5 py-3 bg-[#003d9b] text-white rounded-xl font-semibold hover:bg-[#002d72] transition-all active:scale-95"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chapter Card */}
          {bookId && (
            <div className="lg:col-span-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-[#7b2600]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#7b2600] text-2xl">
                    subject
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#7b2600]">Chapters</h3>
                  <p className="text-xs text-slate-500">
                    Topics within the selected book
                  </p>
                </div>
                <button
                  onClick={() => setShowAddChapter(!showAddChapter)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7b2600]/10 text-[#7b2600] rounded-xl font-semibold hover:bg-[#7b2600]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showAddChapter ? "close" : "add"}
                  </span>
                  {showAddChapter ? "Cancel" : "Add"}
                </button>
              </div>
              <div className="mb-6">
                {chapters.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {chapters.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <span className="w-8 h-8 bg-[#7b2600] text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                          {ch.chapter_number}
                        </span>
                        <span className="text-slate-700 font-medium">
                          {ch.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-2 block">
                      menu_book
                    </span>
                    <p className="font-medium">No chapters added yet</p>
                  </div>
                )}
              </div>
              {showAddChapter && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    placeholder="Chapter no."
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(e.target.value)}
                    className="sm:w-40 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7b2600]/30 focus:border-[#7b2600] transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Chapter name"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7b2600]/30 focus:border-[#7b2600] transition-all"
                  />
                  <button
                    onClick={async () => {
                      await api.addChapter(bookId, chapterNumber, chapterName);
                      setChapterName("");
                      setChapterNumber("");
                      setShowAddChapter(false);
                      setChapters(await api.getChapters(bookId));
                    }}
                    className="px-6 py-3 bg-[#7b2600] text-white rounded-xl font-semibold hover:bg-[#5a1c00] transition-all active:scale-95 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">save</span>
                    Save
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
