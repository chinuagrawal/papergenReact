import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ---------------- AUTO RESIZE TEXTAREA ---------------- */
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
        padding: "12px 14px",
        fontSize: "15px",
        lineHeight: "1.7",
        fontFamily: "Inter, system-ui, sans-serif",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fff",
      }}
    />
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function AdminOcrReview() {
  const { jobId, chapterId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* -------- FETCH OCR RESULT -------- */
  useEffect(() => {
    fetch(`${API}/ocr-result/${jobId}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  /* -------- QUESTION HANDLERS -------- */
  const updateQuestion = (qIdx, field, value) => {
    const copy = [...questions];
    copy[qIdx][field] = value;
    setQuestions(copy);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        answer: "",
        marks: null,
        type: "Short",
        subQuestions: [],
      },
    ]);
  };

  const deleteQuestion = qIdx => {
    const copy = [...questions];
    copy.splice(qIdx, 1);
    setQuestions(copy);
  };

  /* -------- SUB QUESTION HANDLERS -------- */
  const addSubQuestion = qIdx => {
    const copy = [...questions];
    copy[qIdx].subQuestions.push({
      label: String.fromCharCode(97 + copy[qIdx].subQuestions.length),
      text: "",
    });
    setQuestions(copy);
  };

  const deleteSubQuestion = (qIdx, sIdx) => {
    const copy = [...questions];
    copy[qIdx].subQuestions.splice(sIdx, 1);
    setQuestions(copy);
  };

  /* -------- SAVE -------- */
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
    setMessage(data.success ? "✅ Questions saved" : "❌ Save failed");
    setSaving(false);
  };

  if (loading) return <p style={{ padding: 30 }}>Loading OCR preview…</p>;

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 1100,
        margin: "auto",
        background: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 24 }}>
        📄 OCR Review – Job {jobId}
      </h1>

      {questions.map((q, qIdx) => (
        <div
          key={qIdx}
          style={{
            background: "#ffffff",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          }}
        >
          {/* QUESTION */}
          <div style={{ marginBottom: 16 }}>
            <strong>Question</strong>
            <AutoTextarea
              value={q.questionText}
              onChange={e =>
                updateQuestion(qIdx, "questionText", e.target.value)
              }
            />
          </div>

          {/* ANSWER */}
          <div style={{ marginBottom: 16 }}>
            <strong>Answer</strong>
            <AutoTextarea
              value={q.answer || ""}
              onChange={e =>
                updateQuestion(qIdx, "answer", e.target.value)
              }
            />
          </div>

          {/* META */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <input
              type="number"
              placeholder="Marks"
              value={q.marks || ""}
              onChange={e =>
                updateQuestion(qIdx, "marks", Number(e.target.value))
              }
              style={{
                width: 100,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            />

            <select
              value={q.type}
              onChange={e =>
                updateQuestion(qIdx, "type", e.target.value)
              }
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            >
              <option>Very Short</option>
              <option>Short</option>
              <option>Long</option>
              <option>Structured</option>
            </select>
          </div>

          {/* SUB QUESTIONS */}
          {q.subQuestions.length > 0 && (
            <>
              <strong>Sub-Questions</strong>
              {q.subQuestions.map((sq, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    marginTop: 12,
                    padding: 14,
                    background: "#f9fafb",
                    borderLeft: "4px solid #2563eb",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    ({sq.label})
                  </div>

                  <AutoTextarea
                    value={sq.text}
                    onChange={e => {
                      const copy = [...questions];
                      copy[qIdx].subQuestions[sIdx].text = e.target.value;
                      setQuestions(copy);
                    }}
                  />

                  <button
                    onClick={() => deleteSubQuestion(qIdx, sIdx)}
                    style={{
                      marginTop: 8,
                      color: "#dc2626",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    ❌ Delete Sub-Question
                  </button>
                </div>
              ))}
            </>
          )}

          {/* ACTIONS */}
          <div style={{ marginTop: 16 }}>
            <button onClick={() => addSubQuestion(qIdx)}>
              ➕ Add Sub-Question
            </button>
            <button
              onClick={() => deleteQuestion(qIdx)}
              style={{ marginLeft: 12, color: "#dc2626" }}
            >
              🗑 Delete Question
            </button>
          </div>
        </div>
      ))}

      {/* GLOBAL ACTIONS */}
      <div style={{ marginTop: 30 }}>
        <button onClick={addQuestion}>➕ Add Question</button>
        <button
          onClick={saveQuestions}
          disabled={saving}
          style={{ marginLeft: 12 }}
        >
          {saving ? "Saving…" : "💾 Save All"}
        </button>
      </div>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
