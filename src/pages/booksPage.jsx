import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;

function SelectChapter() {
  const navigate = useNavigate();

  const [selection, setSelection] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeBook, setActiveBook] = useState("");

  const BOOK_LIST = [
    "NCERT",
    "NCERT Exemplar",
    "Question Bank",
    "PYQs",
    "Sample Papers",
    "Board Papers",
  ];

  // ---- Load saved selection from backend ----
  useEffect(() => {
    const mobile = localStorage.getItem("userMobile");

    axios
      .post("${API}/api/get-last-selection", { teacher: mobile })
      .then((res) => {
        if (res.data.success) {
          setSelection(res.data.selection);
        }
      });

  }, []);

  // ---- Load chapters when book is clicked ----
  useEffect(() => {
    if (!activeBook) return;

    // TODO: Fetch real chapters from DB later
    setChapters([
      "Chapter 1: Introduction",
      "Chapter 2: Concepts",
      "Chapter 3: Theory",
      "Chapter 4: Exercises",
      "Chapter 5: Summary",
    ]);
  }, [activeBook]);

  const handleChapterSelect = (chapterName) => {
    navigate("/question-select", {
      state: {
        ...selection,
        book: activeBook,
        chapter: chapterName,
      },
    });
  };

  if (!selection)
    return (
      <p className="text-center text-gray-600 mt-10">Loading...</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-5">
      <div className="max-w-lg mx-auto bg-white p-5 rounded-3xl shadow-xl">

        {/* HEADER */}
        <h2 className="text-2xl font-bold text-center mb-1 text-purple-700">
          Select Chapter
        </h2>
        <p className="text-center text-sm text-gray-500 mb-5">
          {selection.className} • {selection.subject}
        </p>

        {/* BOOK TABS */}
        <div className="flex overflow-x-auto gap-3 mb-5 pb-2 no-scrollbar">
          {selection.bookTypes.map((book) => (
            <button
              key={book}
              onClick={() => setActiveBook(book)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm transition-all
                ${
                  activeBook === book
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }
              `}
            >
              {book}
            </button>
          ))}
        </div>

        {/* CHAPTER LIST */}
        <div className="space-y-3 mt-3">
          {activeBook ? (
            chapters.map((chapter, i) => (
              <div
                key={i}
                onClick={() => handleChapterSelect(chapter)}
                className="p-4 border rounded-xl shadow-sm hover:bg-purple-50 cursor-pointer transition"
              >
                <span className="font-medium">{chapter}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-10">
              Select a book type above 👆
            </p>
          )}
        </div>

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/teacher")}
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-xl"
        >
          ⬅ Back
        </button>
      </div>
    </div>
  );
}

export default SelectChapter;
