import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function SelectChapter() {
  const navigate = useNavigate();
  const { state: selection } = useLocation();

  const [activeBook, setActiveBook] = useState("");
  const [chapters, setChapters] = useState([]);

  if (!selection) return <h1>No selection data</h1>;

  // when user clicks a book
  const handleBookClick = (book) => {
    setActiveBook(book);
    setChapters([
      "Chapter 1: Introduction",
      "Chapter 2: Concepts",
      "Chapter 3: Theory",
      "Chapter 4: Exercises",
      "Chapter 5: Summary",
    ]);
  };

  const handleChapterSelect = (chapter) => {
    navigate("/question-select", {
      state: {
        ...selection,
        book: activeBook,
        chapter
      }
    });
  };

  return (
    <div>
      <h1>Select Chapter</h1>
      <p>{selection.className} • {selection.subject}</p>

      {/* BOOK TABS */}
      {selection.bookTypes.map((b) => (
        <button key={b} onClick={() => handleBookClick(b)}>
          {b}
        </button>
      ))}

      {/* CHAPTER LIST */}
      {activeBook && chapters.map((ch) => (
        <div key={ch} onClick={() => handleChapterSelect(ch)}>
          {ch}
        </div>
      ))}
    </div>
  );
}

export default SelectChapter;
