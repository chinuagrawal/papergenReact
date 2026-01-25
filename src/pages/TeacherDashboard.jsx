import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../services/masterDataApi";

const API = import.meta.env.VITE_API_URL;

function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ---- Dashboard form states ----
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);

  const [boardId, setBoardId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState([]);

  const [loadingData, setLoadingData] = useState(false);

  // ---- Check login ----
  useEffect(() => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return navigate("/");

    axios
      .post(`${API}/api/get-user`, { mobile })
      .then((res) => {
        if (res.data.success) setUser(res.data.user);
        else navigate("/");
      })
      .catch(() => navigate("/"));
  }, []);

  // ---- Fetch Boards on Load ----
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoadingData(true);
        const data = await api.getBoards();
        setBoards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch boards:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchBoards();
  }, []);

  // ---- Fetch Classes when Board changes ----
  useEffect(() => {
    if (boardId) {
      const fetchClasses = async () => {
        try {
          const data = await api.getClasses(boardId);
          setClasses(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch classes:", err);
          setClasses([]);
        }
      };
      fetchClasses();
      setClassId("");
      setSubjectId("");
      setBooks([]);
      setSelectedBookIds([]);
    } else {
      setClasses([]);
    }
  }, [boardId]);

  // ---- Fetch Subjects when Class changes ----
  useEffect(() => {
    if (classId) {
      const fetchSubjects = async () => {
        try {
          const data = await api.getSubjects(classId);
          setSubjects(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch subjects:", err);
          setSubjects([]);
        }
      };
      fetchSubjects();
      setSubjectId("");
      setBooks([]);
      setSelectedBookIds([]);
    } else {
      setSubjects([]);
    }
  }, [classId]);

  // ---- Fetch Books when Subject changes ----
  useEffect(() => {
    if (subjectId) {
      const fetchBooks = async () => {
        try {
          const data = await api.getBooks(subjectId);
          setBooks(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch books:", err);
          setBooks([]);
        }
      };
      fetchBooks();
      setSelectedBookIds([]);
    } else {
      setBooks([]);
    }
  }, [subjectId]);

  const handleBookToggle = (bookId) => {
    if (selectedBookIds.includes(bookId)) {
      setSelectedBookIds(selectedBookIds.filter((id) => id !== bookId));
    } else {
      setSelectedBookIds([...selectedBookIds, bookId]);
    }
  };

  const handleSubmit = async () => {
    if (!boardId || !classId || !subjectId || !selectedBookIds.length)
      return alert(
        "Please select Board, Class, Subject, and at least one Book",
      );

    const selectedBoard = boards.find((b) => b.id == boardId);
    const selectedClass = classes.find((c) => c.id == classId);
    const selectedSubject = subjects.find((s) => s.id == subjectId);
    const selectedBooks = books.filter((b) => selectedBookIds.includes(b.id));

    navigate("/selectedBooks", {
      state: {
        board: selectedBoard,
        class: selectedClass,
        subject: selectedSubject,
        books: selectedBooks,
        teacher: user.mobile,
      },
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <span className="text-gray-500 font-medium animate-pulse">
          Loading Dashboard...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200 px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="material-icons">arrow_back</span>
        </button>

        <h1 className="text-lg font-bold text-gray-800">Teacher Dashboard</h1>

        <button
          onClick={handleLogout}
          className="p-2 -mr-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <span className="material-icons">logout</span>
        </button>
      </nav>

      {/* CONTENT */}
      <div className="max-w-md mx-auto p-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <span className="material-icons text-2xl">person</span>
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Welcome back,</p>
              <h2 className="text-xl font-bold tracking-tight">
                {user.mobile}
              </h2>
            </div>
          </div>
          <p className="text-blue-100 text-sm mt-2 opacity-90">
            Start creating your next question paper.
          </p>
        </div>

        {/* Selection Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
            {/* Board */}
            <div className="p-4 border-b border-gray-100 last:border-0">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Board
              </label>
              <select
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                className="w-full bg-transparent text-gray-800 font-medium focus:outline-none"
              >
                <option value="">Select Board</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div className="p-4 border-b border-gray-100 last:border-0">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={!boardId}
                className={`w-full bg-transparent text-gray-800 font-medium focus:outline-none ${
                  !boardId && "text-gray-400"
                }`}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="p-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={!classId}
                className={`w-full bg-transparent text-gray-800 font-medium focus:outline-none ${
                  !classId && "text-gray-400"
                }`}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Books Selection */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <label className="text-sm font-bold text-gray-700">
                Select Books
              </label>
              {selectedBookIds.length > 0 && (
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {selectedBookIds.length} Selected
                </span>
              )}
            </div>

            {loadingData && books.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Loading books...
              </div>
            ) : books.length === 0 ? (
              <div className="bg-gray-100 rounded-xl p-8 text-center border border-dashed border-gray-300">
                <span className="material-icons text-gray-300 text-3xl mb-2">
                  menu_book
                </span>
                <p className="text-gray-500 text-sm">
                  Select a subject to view books
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {books.map((b) => {
                  const isSelected = selectedBookIds.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleBookToggle(b.id)}
                      className={`relative p-4 rounded-xl text-left transition-all border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-sm line-clamp-2">
                          {b.name}
                        </span>
                        {isSelected && (
                          <span className="material-icons text-sm">
                            check_circle
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button / Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!selectedBookIds.length}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
              selectedBookIds.length
                ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue
            <span className="material-icons text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
