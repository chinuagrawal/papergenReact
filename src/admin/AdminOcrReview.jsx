import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminOcrReview() {
  const { jobId, chapterId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("processing");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  /* ---------------- TOAST NOTIFICATION ---------------- */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ---------------- FETCH OCR RESULT ---------------- */
  const fetchOcrResult = async () => {
    try {
      const res = await fetch(`${API}/api/admin/ocr-result/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch OCR result");

      const data = await res.json();

      if (data.status !== "completed") {
        setStatus(data.status);
        return;
      }

      setStatus("completed");

      // Normalize questions with all fields including questionNumber
      const normalized = (data.questions || []).map((q, idx) => ({
        id: q.id || `temp-${idx}`,
        questionNumber: q.questionNumber || idx + 1,
        questionText: q.questionText || "",
        answer: q.answer || "",
        questionImage: q.questionImage || null,
        answerImage: q.answerImage || null,
        marks: q.marks || null,
        type: q.type || "Short",
        year: q.year || null,
        confidence: q.confidence || 0.5,
        page: q.page || null,
      }));

      setQuestions(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Failed to load OCR results", "error");
    }
  };

  /* ---------------- POLLING ---------------- */
  useEffect(() => {
    let intervalId;

    const startPolling = async () => {
      try {
        const res = await fetch(`${API}/api/admin/ocr-result/${jobId}`);
        const data = await res.json();

        if (data.status === "completed") {
          setStatus("completed");

          const normalized = (data.questions || []).map((q, idx) => ({
            id: q.id || `temp-${idx}`,
            questionNumber: q.questionNumber || idx + 1,
            questionText: q.questionText || "",
            answer: q.answer || "",
            questionImage: q.questionImage || null,
            answerImage: q.answerImage || null,
            marks: q.marks || null,
            type: q.type || "Short",
            year: q.year || null,
            confidence: q.confidence || 0.5,
            page: q.page || null,
          }));

          setQuestions(normalized);
          clearInterval(intervalId);
        } else {
          setStatus(data.status);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    startPolling();
    intervalId = setInterval(startPolling, 4000);

    return () => clearInterval(intervalId);
  }, [jobId]);

  /* ---------------- HELPERS ---------------- */
  const handleImageUpload = async (file, index, field) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      showToast("Uploading image...", "info");
      const res = await fetch(`${API}/api/admin/upload-image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        updateQuestion(index, field, data.imageUrl);
        showToast("Image uploaded successfully", "success");
      } else {
        showToast("Image upload failed", "error");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Image upload failed", "error");
    }
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        questionNumber: prev.length + 1,
        questionText: "",
        answer: "",
        questionImage: null,
        answerImage: null,
        marks: null,
        type: "Short",
        year: null,
        confidence: 0.5,
        page: null,
      },
    ]);
  };

  const deleteQuestion = (index) => {
    if (!window.confirm("Delete this question?")) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    showToast("Question deleted", "success");
  };

  const duplicateQuestion = (index) => {
    const question = questions[index];
    setQuestions((prev) => [
      ...prev,
      {
        ...question,
        id: `temp-${Date.now()}`,
        questionNumber: prev.length + 1,
      },
    ]);
    showToast("Question duplicated", "success");
  };

  /* ---------------- SAVE ---------------- */
  const saveQuestions = async () => {
    setSaving(true);

    try {
      // Prepare questions for saving (remove temp IDs)
      const questionsToSave = questions.map((q) => ({
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        answer: q.answer,
        marks: q.marks,
        type: q.type,
        year: q.year,
        questionImage: q.questionImage,
        answerImage: q.answerImage,
      }));

      const res = await fetch(`${API}/api/admin/save-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          chapterId,
          questions: questionsToSave,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast(
          `✅ ${data.count || questions.length} questions saved successfully!`,
          "success",
        );
        // Optionally navigate back or refresh
        setTimeout(() => {
          navigate("/admin/ocr-upload");
        }, 2000);
      } else {
        showToast("❌ Save failed. Please try again.", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Save failed. Please check your connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- LOADING STATE ---------------- */
  if (status !== "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white/80 backdrop-blur-lg p-12 rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Processing OCR
            </h2>
            <p className="text-gray-600">
              {status === "processing"
                ? "Analyzing document and extracting questions..."
                : "Please wait, this may take a minute"}
            </p>
            <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-300 ${
            toast.type === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {toast.type === "success" ? "✓" : "✕"}
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                OCR Review Panel
              </h1>
              <p className="text-gray-600">
                Job ID:{" "}
                <span className="font-mono font-semibold text-gray-800">
                  {jobId}
                </span>
                {chapterId && (
                  <>
                    {" "}
                    • Chapter ID:{" "}
                    <span className="font-mono font-semibold text-gray-800">
                      {chapterId}
                    </span>
                  </>
                )}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {questions.length} question{questions.length !== 1 ? "s" : ""}{" "}
                extracted
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={addQuestion}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span>+</span>
                <span>Add Question</span>
              </button>

              <button
                onClick={saveQuestions}
                disabled={saving}
                className={`px-6 py-2.5 rounded-xl font-semibold shadow-lg transform transition-all duration-200 flex items-center gap-2 ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-105"
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No questions found
            </h3>
            <p className="text-gray-500 mb-6">
              Add your first question to get started
            </p>
            <button
              onClick={addQuestion}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Add Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Question Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg">
                        {q.questionNumber || idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          Question {q.questionNumber || idx + 1}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                          {q.page && (
                            <span className="px-2 py-1 bg-white/60 rounded-lg">
                              📄 Page {q.page}
                            </span>
                          )}
                          {q.year && (
                            <span className="px-2 py-1 bg-white/60 rounded-lg">
                              📅 {q.year}
                            </span>
                          )}
                          {q.confidence && (
                            <span className="px-2 py-1 bg-white/60 rounded-lg">
                              Confidence: {Math.round(q.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateQuestion(idx)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 text-sm"
                        title="Duplicate question"
                      >
                        📋 Duplicate
                      </button>
                      <button
                        onClick={() => deleteQuestion(idx)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors duration-200 text-sm"
                        title="Delete question"
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() =>
                          setExpandedQuestion(
                            expandedQuestion === idx ? null : idx,
                          )
                        }
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors duration-200 text-sm"
                      >
                        {expandedQuestion === idx ? "▲ Collapse" : "▼ Expand"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Content */}
                <div className="p-6 space-y-5">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-y min-h-[120px] font-medium text-gray-800"
                      placeholder="Enter question text here..."
                      value={q.questionText}
                      onChange={(e) =>
                        updateQuestion(idx, "questionText", e.target.value)
                      }
                      rows={Math.max(3, Math.ceil(q.questionText.length / 80))}
                    />

                    {/* Question Image */}
                    <div className="mt-3">
                      {q.questionImage && (
                        <div className="mb-2 relative w-48 h-auto group">
                          <img
                            src={q.questionImage}
                            alt="Question"
                            className="w-full h-auto object-contain rounded-lg border bg-gray-50"
                            onError={(e) => {
                              console.error(
                                "Image load error:",
                                q.questionImage,
                              );
                              // e.target.src = "fallback_image_url"; // Optional
                            }}
                          />
                          <button
                            onClick={() =>
                              updateQuestion(idx, "questionImage", null)
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <span className="material-icons text-gray-500">
                          add_photo_alternate
                        </span>
                        {q.questionImage ? "Change Image" : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(
                              e.target.files[0],
                              idx,
                              "questionImage",
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Marks
                      </label>
                      <input
                        type="number"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                        placeholder="e.g., 5"
                        value={q.marks || ""}
                        onChange={(e) =>
                          updateQuestion(
                            idx,
                            "marks",
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium bg-white"
                        value={q.type}
                        onChange={(e) =>
                          updateQuestion(idx, "type", e.target.value)
                        }
                      >
                        <option value="Very Short">Very Short</option>
                        <option value="Short">Short</option>
                        <option value="Long">Long</option>
                        <option value="MCQ">MCQ</option>
                        <option value="Numerical">Numerical</option>
                        <option value="Assertion">Assertion</option>
                        <option value="Fill">Fill in the Blank</option>
                        <option value="CaseStudy">Case Study</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year (Optional)
                      </label>
                      <input
                        type="number"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                        placeholder="e.g., 2023"
                        value={q.year || ""}
                        onChange={(e) =>
                          updateQuestion(
                            idx,
                            "year",
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Answer */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Answer
                    </label>
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-y min-h-[100px] font-medium text-gray-800"
                      placeholder="Enter answer here..."
                      value={q.answer}
                      onChange={(e) =>
                        updateQuestion(idx, "answer", e.target.value)
                      }
                      rows={Math.max(4, Math.ceil(q.answer.length / 80))}
                    />

                    {/* Answer Image */}
                    <div className="mt-3">
                      {q.answerImage && (
                        <div className="mb-2 relative w-48 h-auto group">
                          <img
                            src={q.answerImage}
                            alt="Answer"
                            className="w-full h-auto object-contain rounded-lg border bg-gray-50"
                          />
                          <button
                            onClick={() =>
                              updateQuestion(idx, "answerImage", null)
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <span className="material-icons text-gray-500">
                          add_photo_alternate
                        </span>
                        {q.answerImage ? "Change Image" : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageUpload(
                              e.target.files[0],
                              idx,
                              "answerImage",
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        {questions.length > 0 && (
          <div className="mt-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-600">
                Total:{" "}
                <span className="font-bold text-gray-800">
                  {questions.length}
                </span>{" "}
                question{questions.length !== 1 ? "s" : ""}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/admin/ocr-upload")}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors duration-200"
                >
                  ← Back
                </button>
                <button
                  onClick={saveQuestions}
                  disabled={saving}
                  className={`px-8 py-2.5 rounded-xl font-semibold shadow-lg transform transition-all duration-200 ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-105"
                  }`}
                >
                  {saving ? "Saving..." : "💾 Save All Questions"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
