import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/masterDataApi";

function SelectChapter() {
  const navigate = useNavigate();
  const { state: selection } = useLocation();

  const [activeBookId, setActiveBookId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChaptersMap, setSelectedChaptersMap] = useState({}); // { bookId: [chapterId1, ...] }
  const [loadingChapters, setLoadingChapters] = useState(false);

  // Initialize active book
  useEffect(() => {
    if (selection?.books?.length > 0 && !activeBookId) {
      setActiveBookId(selection.books[0].id);
    }
  }, [selection]);

  // Fetch chapters when active book changes
  useEffect(() => {
    if (activeBookId) {
      const fetchChapters = async () => {
        try {
          setLoadingChapters(true);
          const data = await api.getChapters(activeBookId);
          setChapters(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch chapters:", err);
          setChapters([]);
        } finally {
          setLoadingChapters(false);
        }
      };
      fetchChapters();
    }
  }, [activeBookId]);

  if (!selection)
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-gray-600">
        No selection data found. Please go back to dashboard.
      </div>
    );

  const handleChapterToggle = (chapterId) => {
    const currentBookChapters = selectedChaptersMap[activeBookId] || [];
    let newBookChapters;

    if (currentBookChapters.includes(chapterId)) {
      newBookChapters = currentBookChapters.filter((id) => id !== chapterId);
    } else {
      newBookChapters = [...currentBookChapters, chapterId];
    }

    setSelectedChaptersMap({
      ...selectedChaptersMap,
      [activeBookId]: newBookChapters,
    });
  };

  const handleNext = () => {
    // Flatten selected chapters
    const allSelectedChapters = [];
    selection.books.forEach((book) => {
      const chapterIds = selectedChaptersMap[book.id] || [];
      if (chapterIds.length > 0) {
        allSelectedChapters.push({
          bookId: book.id,
          bookName: book.name,
          chapterIds: chapterIds,
        });
      }
    });

    if (allSelectedChapters.length === 0) {
      alert("Please select at least one chapter.");
      return;
    }

    // Navigate to next step (Paper Generation)
    navigate("/manual-paper-selection", {
      // Updated route name
      state: {
        ...selection,
        selectedChapters: allSelectedChapters,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Select Chapters
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {selection.board?.name}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              {selection.class?.class_name}
            </span>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full">
              {selection.subject?.name}
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 min-h-[500px] flex flex-col">
          {/* Book Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {selection.books.map((book) => {
              const isSelected = activeBookId === book.id;
              const count = (selectedChaptersMap[book.id] || []).length;

              return (
                <button
                  key={book.id}
                  onClick={() => setActiveBookId(book.id)}
                  className={`px-5 py-2.5 rounded-t-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    isSelected
                      ? "bg-white border-b-2 border-blue-500 text-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {book.name}
                  {count > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Chapter Selection Area */}
          <div className="flex-1">
            {loadingChapters ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : chapters.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No chapters found for this book.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chapters.map((ch) => {
                  const isChecked = (
                    selectedChaptersMap[activeBookId] || []
                  ).includes(ch.id);
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleChapterToggle(ch.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ${
                        isChecked
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isChecked && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <div>
                        <h3
                          className={`font-semibold ${isChecked ? "text-blue-700" : "text-gray-700"}`}
                        >
                          {ch.chapter_number}. {ch.name}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer / Next Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Total Selected: {Object.values(selectedChaptersMap).flat().length}{" "}
              Chapters
            </div>
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Generate Paper ➜
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectChapter;
