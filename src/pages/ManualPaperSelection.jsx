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

  // Paper Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [paperSettings, setPaperSettings] = useState({
    instituteName: "",
    testName: "",
    examType: "JEE/NEET JEE",
    date: new Date().toISOString().split("T")[0],
    time: "",
    hideDate: false,
    watermark: {
      enabled: false,
      type: "logo", // 'logo' | 'text'
      text: "",
      image: null,
    },
    logo: null, // Institute logo
    showBorder: true,
    footerMessage: "wish you all the best",
    twoColumns: false,
    sectionWise: false, // Not implemented fully yet
  });

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
    // Show settings modal instead of printing directly
    setShowSettings(true);
  };

  const confirmPrint = () => {
    setShowSettings(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaperSettings((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
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

      {/* Paper Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                Export PDF Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institute Logo Title (Size: 320 x 50 mm)
                </label>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 border rounded-lg px-3 py-2 text-gray-500 bg-gray-50 truncate">
                    {paperSettings.logo
                      ? "Logo Uploaded"
                      : "Upload Institute Logo"}
                  </div>
                  <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                {paperSettings.logo && (
                  <img
                    src={paperSettings.logo}
                    alt="Preview"
                    className="mt-2 h-16 object-contain"
                  />
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2"
                    value={paperSettings.date}
                    onChange={(e) =>
                      setPaperSettings({
                        ...paperSettings,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time (mins)
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g. 180"
                    value={paperSettings.time}
                    onChange={(e) =>
                      setPaperSettings({
                        ...paperSettings,
                        time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hideDate"
                  checked={paperSettings.hideDate}
                  onChange={(e) =>
                    setPaperSettings({
                      ...paperSettings,
                      hideDate: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="hideDate" className="text-gray-700">
                  Hide Date
                </label>
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute Name
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter institute name"
                    value={paperSettings.instituteName}
                    onChange={(e) =>
                      setPaperSettings({
                        ...paperSettings,
                        instituteName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Test Name
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g. Monthly Test"
                    value={paperSettings.testName}
                    onChange={(e) =>
                      setPaperSettings({
                        ...paperSettings,
                        testName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="JEE/NEET JEE"
                    value={paperSettings.examType}
                    onChange={(e) =>
                      setPaperSettings({
                        ...paperSettings,
                        examType: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Watermark */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="wm_enable"
                    checked={paperSettings.watermark.enabled}
                    onChange={(e) =>
                      setPaperSettings({
                        ...paperSettings,
                        watermark: {
                          ...paperSettings.watermark,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor="wm_enable"
                    className="font-semibold text-gray-800"
                  >
                    Set Watermark
                  </label>
                </div>

                {paperSettings.watermark.enabled && (
                  <div className="ml-6 space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="wm_type"
                          checked={paperSettings.watermark.type === "logo"}
                          onChange={() =>
                            setPaperSettings({
                              ...paperSettings,
                              watermark: {
                                ...paperSettings.watermark,
                                type: "logo",
                              },
                            })
                          }
                          className="text-blue-600"
                        />
                        <span>Logo</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="wm_type"
                          checked={paperSettings.watermark.type === "text"}
                          onChange={() =>
                            setPaperSettings({
                              ...paperSettings,
                              watermark: {
                                ...paperSettings.watermark,
                                type: "text",
                              },
                            })
                          }
                          className="text-blue-600"
                        />
                        <span>Text</span>
                      </label>
                    </div>

                    {paperSettings.watermark.type === "text" && (
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Watermark Text"
                        value={paperSettings.watermark.text}
                        onChange={(e) =>
                          setPaperSettings({
                            ...paperSettings,
                            watermark: {
                              ...paperSettings.watermark,
                              text: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Border */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Border</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="border"
                      checked={paperSettings.showBorder}
                      onChange={() =>
                        setPaperSettings({ ...paperSettings, showBorder: true })
                      }
                      className="text-blue-600"
                    />
                    <span>With Border</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="border"
                      checked={!paperSettings.showBorder}
                      onChange={() =>
                        setPaperSettings({
                          ...paperSettings,
                          showBorder: false,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span>Without Border</span>
                  </label>
                </div>
              </div>

              {/* Footer Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Message
                </label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="wish you all the best"
                  value={paperSettings.footerMessage}
                  onChange={(e) =>
                    setPaperSettings({
                      ...paperSettings,
                      footerMessage: e.target.value,
                    })
                  }
                />
              </div>

              {/* Other Options */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paperSettings.twoColumns}
                    onChange={(e) =>
                      setPaperSettings({
                        ...paperSettings,
                        twoColumns: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Two Columns</span>
                </label>
                {/* Add placeholders for other options mentioned in screenshot if needed */}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end sticky bottom-0">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmPrint}
                className="px-6 py-2 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-lg"
              >
                Pdf Preview & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Area */}
      <div
        className={`max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8 print:shadow-none print:w-auto print:max-w-none relative
          ${paperSettings.showBorder ? "print:border-[3px] print:border-black print:p-6" : "print:border-0 print:p-0"}
        `}
      >
        {/* Watermark */}
        {paperSettings.watermark.enabled && (
          <div className="hidden print:flex fixed inset-0 items-center justify-center pointer-events-none z-0 opacity-10">
            {paperSettings.watermark.type === "logo" && paperSettings.logo ? (
              <img
                src={paperSettings.logo}
                alt="Watermark"
                className="w-1/2 opacity-20"
              />
            ) : (
              <div className="text-6xl font-bold text-gray-400 -rotate-45 whitespace-nowrap">
                {paperSettings.watermark.text || paperSettings.instituteName}
              </div>
            )}
          </div>
        )}
        {/* Paper Header (Visible only in print or preview) */}
        <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
          <div className="flex justify-between items-start mb-4">
            {/* Left: Logo */}
            <div className="w-1/4">
              {paperSettings.logo && (
                <img
                  src={paperSettings.logo}
                  alt="Institute Logo"
                  className="h-20 object-contain"
                />
              )}
            </div>

            {/* Center: Institute Details */}
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold uppercase tracking-wide">
                {paperSettings.instituteName || "INSTITUTE NAME"}
              </h1>
              <h2 className="text-xl font-semibold mt-1">
                {paperSettings.testName || "TEST NAME"}
              </h2>
              <p className="text-sm font-medium mt-1 uppercase">
                {paperSettings.examType}
              </p>
            </div>

            {/* Right: Date/Time */}
            <div className="w-1/4 text-right text-sm font-semibold">
              {!paperSettings.hideDate && <p>Date: {paperSettings.date}</p>}
              {paperSettings.time && <p>Time: {paperSettings.time} Min</p>}
              <p>
                Max Marks: {/* Calculate Total Marks here if needed */ "100"}
              </p>
            </div>
          </div>
        </div>
        {/* Two Column Layout Wrapper */}
        <div
          className={`${paperSettings.twoColumns ? "print:columns-2 print:gap-8" : ""}`}
        >
          {Object.entries(groupedQuestions).map(([type, qs]) => (
            <div key={type} className="mb-8 break-inside-avoid">
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
                          <div className="flex justify-between items-start gap-4">
                            <p className="flex-1 min-w-0 text-gray-900 font-medium text-lg leading-relaxed print:text-black whitespace-pre-wrap">
                              <span className="font-bold mr-2">{idx + 1}.</span>
                              {q.question_text || q.questionText}
                            </p>

                            {q.marks && (
                              <span className="flex-shrink-0 text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded print:text-black print:bg-transparent print:border print:border-black whitespace-nowrap">
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
        </div>{" "}
        {/* End of Two Column Wrapper */}
        {/* Footer Message */}
        {paperSettings.footerMessage && (
          <div className="hidden print:block text-center mt-8 pt-4 border-t border-gray-300 text-gray-600 italic font-medium break-inside-avoid">
            {paperSettings.footerMessage}
          </div>
        )}
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
