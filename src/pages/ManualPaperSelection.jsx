import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ManualPaperSelection.css";

const API = import.meta.env.VITE_API_URL;

function ManualPaperSelection() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const printRef = useRef();

  const [questions, setQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get chapter IDs from state
  const selectedChapters = state?.selectedChapters || [];
  const chapterIds = selectedChapters.flatMap((b) => b.chapterIds);

  useEffect(() => {
    if (chapterIds.length === 0) {
      setError("No chapters selected.");
      return;
    }

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await axios.post(`${API}/api/get-questions-by-chapters`, {
          chapterIds,
        });
        if (res.data.success) {
          const qData = res.data.questions;
          setQuestions(qData);
          groupQuestions(qData);
        } else {
          setError(res.data.message || "Failed to fetch questions");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const groupQuestions = (qs) => {
    // Normalize keys
    const groups = {
      "Very Short": [],
      Short: [],
      Long: [],
      MCQ: [],
      Other: [],
    };

    qs.forEach((q) => {
      // Normalize qtype string (handle qtype or question_type)
      let type = q.qtype || q.question_type || "Other";
      if (type.match(/very\s*short/i)) type = "Very Short";
      else if (type.match(/short/i)) type = "Short";
      else if (type.match(/long/i)) type = "Long";
      else if (type.match(/mcq/i)) type = "MCQ";
      else type = "Other";

      if (!groups[type]) groups[type] = [];
      groups[type].push(q);
    });

    // Remove empty groups
    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) delete groups[key];
    });

    setGroupedQuestions(groups);
  };

  const handleToggleQuestion = (id) => {
    const newSet = new Set(selectedQuestionIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestionIds(newSet);
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
      {/* Controls - Hidden when printing */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Select Questions</h1>
          <p className="text-gray-600">
            {questions.length} questions found across {selectedChapters.length}{" "}
            book(s).
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>

          <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 select-none">
            <input
              type="checkbox"
              checked={includeAnswers}
              onChange={(e) => setIncludeAnswers(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 font-medium">
              Include Answer Key
            </span>
          </label>

          <button
            onClick={handlePrint}
            disabled={selectedQuestionIds.size === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export / Print PDF ({selectedQuestionIds.size})
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-10">Loading questions...</div>}

      {/* Printable Area */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8 print:shadow-none print:w-full print:max-w-none">
        {/* Paper Header (Visible only in print or preview) */}
        <div className="hidden print:block text-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-wide">
            Question Paper
          </h1>
          <p className="text-gray-500 mt-2">Generated by PaperGen</p>
        </div>

        {Object.entries(groupedQuestions).map(([type, qs]) => (
          <div key={type} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4 uppercase print:text-black">
              {type} Answer Questions
            </h2>

            <div className="space-y-4">
              {qs.map((q, idx) => {
                const isSelected = selectedQuestionIds.has(q.id);
                // In print mode, only show selected questions
                // In screen mode, show all with checkbox
                return (
                  <div
                    key={q.id}
                    className={`
                      relative p-4 rounded-lg border transition-all
                      ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}
                      print:border-none print:p-0 print:mb-4 print:bg-transparent
                      ${!isSelected ? "print:hidden" : ""}
                    `}
                  >
                    <div className="flex gap-3">
                      {/* Checkbox - Screen only */}
                      <div className="pt-1 print:hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleQuestion(q.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-gray-900 font-medium text-lg leading-relaxed print:text-black whitespace-pre-wrap">
                            <span className="font-bold mr-2">{idx + 1}.</span>
                            {q.question_text || q.questionText}
                          </p>

                          {q.marks && (
                            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded print:text-black print:bg-transparent print:border print:border-black whitespace-nowrap ml-2">
                              [{q.marks} Marks]
                            </span>
                          )}
                        </div>

                        {/* Display Question Image if available - Moved below question text for better visibility */}
                        {(q.question_image || q.questionImage) && (
                          <div className="mt-3 mb-4 w-full">
                            <img
                              src={q.question_image || q.questionImage}
                              alt={`Question ${idx + 1}`}
                              className="max-w-full md:max-w-xs h-auto max-h-52 object-contain rounded border border-gray-200 bg-white"
                              onError={(e) => {
                                e.target.style.display = "none";
                                console.error(
                                  "Failed to load question image:",
                                  e.target.src,
                                );
                              }}
                            />
                          </div>
                        )}
                        {/* Answer (Optional - maybe toggleable?) */}
                        {/* <p className="mt-2 text-gray-500 text-sm italic">Ans: {q.answer_text}</p> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {questions.length === 0 && !loading && (
          <div className="text-center text-gray-400 py-10">
            No questions available for the selected chapters.
          </div>
        )}

        {/* Answer Key Section */}
        {includeAnswers && selectedQuestionIds.size > 0 && (
          <div
            className="hidden print:block mt-8 pt-8 border-t-2 border-gray-800"
            style={{ pageBreakBefore: "always" }}
          >
            <div className="text-center mb-8 border-b pb-4">
              <h1 className="text-3xl font-bold uppercase tracking-wide">
                Answer Key
              </h1>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedQuestions).map(([type, qs]) => {
                // Filter questions to only include selected ones
                const selectedQs = qs.filter((q) =>
                  selectedQuestionIds.has(q.id),
                );

                if (selectedQs.length === 0) return null;

                return (
                  <div key={type} className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3 uppercase">
                      {type} Answer Questions
                    </h3>
                    <div className="space-y-3">
                      {selectedQs.map((q, idx) => (
                        <div key={q.id} className="flex gap-2 text-sm">
                          <span className="font-bold whitespace-nowrap">
                            {idx + 1}.
                          </span>
                          <div>
                            {/* Answer Text */}
                            {q.answer_text || q.answerText ? (
                              <div className="text-gray-900 font-medium whitespace-pre-wrap">
                                {q.answer_text || q.answerText}
                              </div>
                            ) : (
                              <div className="text-gray-400 italic">
                                No answer text provided
                              </div>
                            )}

                            {/* Answer Image */}
                            {(q.answer_image || q.answerImage) && (
                              <div className="mt-2">
                                <img
                                  src={q.answer_image || q.answerImage}
                                  alt={`Answer ${idx + 1}`}
                                  className="max-w-xs h-auto max-h-40 object-contain rounded border border-gray-200"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManualPaperSelection;
