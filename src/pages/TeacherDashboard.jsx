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
  const [mediums, setMediums] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);

  const [boardId, setBoardId] = useState("");
  const [mediumId, setMediumId] = useState("");
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

  // ---- Fetch Mediums when Board changes ----
  useEffect(() => {
    if (boardId) {
      const fetchMediums = async () => {
        try {
          const data = await api.getMediums(boardId);
          setMediums(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch mediums:", err);
          setMediums([]);
        }
      };
      fetchMediums();
      setMediumId("");
      setClassId("");
      setSubjectId("");
      setBooks([]);
      setSelectedBookIds([]);
    } else {
      setMediums([]);
    }
  }, [boardId]);

  // ---- Fetch Classes when Board and Medium changes ----
  useEffect(() => {
    if (boardId && mediumId) {
      const fetchClasses = async () => {
        try {
          const data = await api.getClasses(boardId, mediumId);
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
  }, [boardId, mediumId]);

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
    if (
      !boardId ||
      !mediumId ||
      !classId ||
      !subjectId ||
      !selectedBookIds.length
    )
      return alert(
        "Please select Board, Medium, Class, Subject, and at least one Book",
      );

    const selectedBoard = boards.find((b) => b.id == boardId);
    const selectedMedium = mediums.find((m) => m.id == mediumId);
    const selectedClass = classes.find((c) => c.id == classId);
    const selectedSubject = subjects.find((s) => s.id == subjectId);
    const selectedBooks = books.filter((b) => selectedBookIds.includes(b.id));

    navigate("/selectedBooks", {
      state: {
        board: selectedBoard,
        medium: selectedMedium,
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
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-[#003d9b]"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gray-600 font-medium text-lg">
            Loading Dashboard...
          </span>
        </div>
      </div>
    );

  // Get display names for filter row
  const selectedBoardName =
    boards.find((b) => b.id == boardId)?.name || "Select Board";
  const selectedMediumName =
    mediums.find((m) => m.id == mediumId)?.name || "Select Medium";
  const selectedClassName =
    classes.find((c) => c.id == classId)?.class_name || "Select Class";

  return (
    <div className="max-w-md mx-auto bg-[#f8fafc] min-h-screen flex flex-col relative pb-24">
      {/* BEGIN: MainHeader */}
      <header className="sticky top-0 bg-white z-50 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu */}
          <button onClick={() => navigate(-1)} className="text-gray-800">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </button>
          {/* Logo */}
          <h1 className="text-2xl font-bold text-[#003d9b] flex items-center">
            Teacher{" "}
            <span className="ml-1 border-b-2 border-[#003d9b]">Pro.</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Logout Button */}
          <button onClick={handleLogout} className="p-1">
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
          </button>
        </div>
      </header>
      {/* END: MainHeader */}

      <main className="flex-1 overflow-y-auto">
        {/* BEGIN: FilterRow */}
        <section className="px-4 py-4 grid grid-cols-3 gap-2">
          {/* Board Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-2 flex flex-col justify-between h-16 shadow-sm">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">
              Board
            </span>
            <select
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              className="text-xs font-bold bg-transparent w-full text-left text-gray-700 truncate focus:outline-none"
            >
              <option value="">Select Board</option>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Medium Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-2 flex flex-col justify-between h-16 shadow-sm">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">
              Medium
            </span>
            <select
              value={mediumId}
              onChange={(e) => setMediumId(e.target.value)}
              disabled={!boardId}
              className="text-xs font-bold bg-transparent w-full text-left text-gray-700 truncate focus:outline-none disabled:text-gray-400"
            >
              <option value="">Select Medium</option>
              {mediums.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Standard Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-2 flex flex-col justify-between h-16 shadow-sm">
            <span className="text-[10px] text-gray-500 font-semibold uppercase">
              Standard
            </span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={!boardId || !mediumId}
              className="text-xs font-bold bg-transparent w-full text-left text-gray-700 truncate focus:outline-none disabled:text-gray-400"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name}
                </option>
              ))}
            </select>
          </div>
        </section>
        {/* END: FilterRow */}

        {/* BEGIN: ProBanner */}
        <section className="px-4 mb-8">
          <div className="bg-[#0f172a] text-white rounded-3xl p-6 flex items-center justify-between relative overflow-hidden h-24">
            <h2 className="text-xl font-bold">Paper Generator</h2>
            <div className="bg-[#003d9b] p-3 rounded-full shadow-lg border-2 border-[#0052cc]">
              <svg
                className="h-8 w-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
              </svg>
            </div>
          </div>
        </section>
        {/* END: ProBanner */}

        {/* BEGIN: Subject Selection */}
        {classId && (
          <section className="px-4 pb-8">
            <h3 className="text-[11px] font-bold text-gray-500 uppercase mb-3">
              Select Subject
            </h3>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSubjectId(subject.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    subjectId == subject.id
                      ? "bg-blue-50 border-blue-500 shadow-sm"
                      : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <span
                    className={`font-bold text-sm ${
                      subjectId == subject.id
                        ? "text-[#003d9b]"
                        : "text-gray-700"
                    }`}
                  >
                    {subject.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        {/* END: Subject Selection */}

        {/* BEGIN: Books Selection */}
        {subjectId && (
          <section className="px-4 pb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase">
                Select Books
              </h3>
              {selectedBookIds.length > 0 && (
                <span className="text-[10px] font-semibold bg-[#003d9b] text-white px-3 py-1 rounded-full">
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
                <span className="text-4xl mb-2 block">📚</span>
                <p className="text-gray-500 text-sm">
                  No books available for this subject
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {books.map((book) => {
                  const isSelected = selectedBookIds.includes(book.id);
                  return (
                    <button
                      key={book.id}
                      onClick={() => handleBookToggle(book.id)}
                      className={`relative p-4 rounded-xl text-left transition-all border ${
                        isSelected
                          ? "bg-[#003d9b] text-white border-[#003d9b] shadow-md transform scale-[1.02]"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-sm line-clamp-2">
                          {book.name}
                        </span>
                        {isSelected && (
                          <svg
                            className="h-5 w-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {/* END: Books Selection */}
      </main>

      {/* BEGIN: BottomAction */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white px-6 py-4 z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleSubmit}
          disabled={!selectedBookIds.length}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
            selectedBookIds.length
              ? "bg-[#003d9b] text-white hover:bg-[#002d72] active:scale-95"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 5l7 7m0 0l-7 7m7-7H3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
          </svg>
        </button>
      </div>
      {/* END: BottomAction */}
    </div>
  );
}

export default TeacherDashboard;
