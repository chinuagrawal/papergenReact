import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminOcrReview() {
  const { jobId, chapterId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("processing");
  const [saving, setSaving] = useState(false);

  /* ---------------- FETCH OCR RESULT ---------------- */
  const fetchOcrResult = async () => {
    const res = await fetch(`${API}/ocr-result/${jobId}`);
    const data = await res.json();

    if (data.status !== "completed") {
      setStatus(data.status);
      return;
    }

    setStatus("completed");

    // normalize questions (ensure required fields)
    const normalized = (data.questions || []).map(q => ({
      questionText: q.questionText || "",
      answer: q.answer || "",
      marks: q.marks || "",
      type: q.type || "Short"
    }));

    setQuestions(normalized);
  };

  /* ---------------- POLLING ---------------- */
  useEffect(() => {
  let intervalId;

  const startPolling = async () => {
    const res = await fetch(`${API}/ocr-result/${jobId}`);
    const data = await res.json();

    if (data.status === "completed") {
      setStatus("completed");

      // 👇 SET QUESTIONS ONLY ONCE
      setQuestions(
        (data.questions || []).map(q => ({
          questionText: q.questionText || "",
          answer: q.answer || "",
          marks: q.marks || "",
          type: q.type || "Short"
        }))
      );

      // ❌ STOP POLLING
      clearInterval(intervalId);
    } else {
      setStatus(data.status);
    }
  };

  startPolling();
  intervalId = setInterval(startPolling, 4000);

  return () => clearInterval(intervalId);
}, [jobId]);


  /* ---------------- HELPERS ---------------- */
  const updateQuestion = (index, field, value) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        questionText: "",
        answer: "",
        marks: "",
        type: "Short"
      }
    ]);
  };

  const deleteQuestion = index => {
    if (!window.confirm("Delete this question?")) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  /* ---------------- SAVE ---------------- */
  const saveQuestions = async () => {
    setSaving(true);

    const res = await fetch(`${API}/save-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        chapterId,
        questions
      })
    });

    const data = await res.json();
    setSaving(false);

    if (data.success) {
      alert("✅ Questions saved successfully");
    } else {
      alert("❌ Save failed");
    }
  };

  /* ---------------- LOADING ---------------- */
  if (status !== "completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow">
          <h2 className="text-lg font-semibold">⏳ OCR is processing…</h2>
          <p className="text-gray-500 mt-2">
            Please wait, large PDFs may take up to a minute
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            📄 OCR Review – Job {jobId}
          </h1>

          <div className="flex gap-3">
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              ➕ Add Question
            </button>

            <button
              onClick={saveQuestions}
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-white ${
                saving
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving…" : "💾 Save"}
            </button>
          </div>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow p-6 border"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg">
                  Question {idx + 1}
                </h2>
                <button
                  onClick={() => deleteQuestion(idx)}
                  className="text-red-600 hover:underline"
                >
                  🗑 Delete
                </button>
              </div>

              {/* QUESTION TEXT */}
              <textarea
                className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500"
                rows={Math.max(3, q.questionText.length / 80)}
                placeholder="Enter question text"
                value={q.questionText}
                onChange={e =>
                  updateQuestion(idx, "questionText", e.target.value)
                }
              />

              {/* META ROW */}
              <div className="flex gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    Marks
                  </label>
                  <input
                    type="number"
                    className="border rounded-lg px-3 py-2 w-24"
                    value={q.marks}
                    onChange={e =>
                      updateQuestion(idx, "marks", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">
                    Type
                  </label>
                  <select
                    className="border rounded-lg px-3 py-2"
                    value={q.type}
                    onChange={e =>
                      updateQuestion(idx, "type", e.target.value)
                    }
                  >
                    <option>Very Short</option>
                    <option>Short</option>
                    <option>Long</option>
                    <option>Numerical</option>
                  </select>
                </div>
              </div>

              {/* ANSWER */}
              <textarea
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                rows={Math.max(4, q.answer.length / 80)}
                placeholder="Answer"
                value={q.answer}
                onChange={e =>
                  updateQuestion(idx, "answer", e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
