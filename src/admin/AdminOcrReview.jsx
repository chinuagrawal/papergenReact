import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ---------- AUTO EXPANDING TEXTAREA ---------- */
function AutoTextarea({ value, onChange, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      style={{
        width: "100%",
        resize: "none",
        overflow: "hidden",
        padding: "14px",
        fontSize: "15px",
        lineHeight: "1.7",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    />
  );
}

/* ---------- MAIN REVIEW PAGE ---------- */
export default function AdminOcrReview() {
  const { jobId, chapterId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* ---------- LOAD OCR RESULT ---------- */
  useEffect(() => {
    fetch(`${API}/ocr-result/${jobId}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  /* ---------- HELPERS ---------- */
  const updateQuestion = (idx, field, value) => {
    const copy = [...questions];
    copy[idx][field] = value;
    setQuestions(copy);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        answer: "",
        marks: "",
        type: "Short",
      },
    ]);
  };

  const deleteQuestion = idx => {
    const copy = [...questions];
    copy.splice(idx, 1);
    setQuestions(copy);
  };

  /* ---------- SAVE ---------- */
  const saveQuestions = async () => {
    setSaving(true);
    setMessage("");

    const res = await fetch(`${API}/save-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        chapterId,
        questions,
      }),
    });

    const data = await res.json();
    setMessage(data.success ? "✅ Questions saved successfully" : "❌ Save failed");
    setSaving(false);
  };

  if (loading) {
    return <p style={{ padding: 40 }}>Loading OCR preview…</p>;
  }

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 1200,
        margin: "auto",
        background: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 30 }}>
        📄 OCR Review – Job {jobId}
      </h1>

      {questions.map((q, idx) => (
        <div
          key={idx}
          style={{
            background: "#ffffff",
            borderRadius: 14,
            padding: 26,
            marginBottom: 26,
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          {/* QUESTION */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Question</label>
            <AutoTextarea
              value={q.questionText}
              onChange={e =>
                updateQuestion(idx, "questionText", e.target.value)
              }
            />
          </div>

          {/* ANSWER */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Answer</label>
            <AutoTextarea
              value={q.answer || ""}
              onChange={e =>
                updateQuestion(idx, "answer", e.target.value)
              }
            />
          </div>

          {/* META */}
          <div style={{ display: "flex", gap: 14 }}>
            <input
              type="number"
              placeholder="Marks"
              value={q.marks || ""}
              onChange={e =>
                updateQuestion(idx, "marks", e.target.value)
              }
              style={{
                width: 100,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />

            <select
              value={q.type}
              onChange={e =>
                updateQuestion(idx, "type", e.target.value)
              }
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            >
              <option>Very Short</option>
              <option>Short</option>
              <option>Long</option>
            </select>

            <button
              onClick={() => deleteQuestion(idx)}
              style={{
                marginLeft: "auto",
                background: "#fee2e2",
                color: "#b91c1c",
                border: "none",
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>
      ))}

      {/* ACTION BAR */}
      <div style={{ marginTop: 30 }}>
        <button
          onClick={addQuestion}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          ➕ Add Question
        </button>

        <button
          onClick={saveQuestions}
          disabled={saving}
          style={{
            marginLeft: 14,
            padding: "12px 18px",
            borderRadius: 10,
            border: "none",
            background: "#16a34a",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {saving ? "Saving…" : "💾 Save All"}
        </button>
      </div>

      {message && (
        <p style={{ marginTop: 16, fontWeight: 600 }}>{message}</p>
      )}
    </div>
  );
}
