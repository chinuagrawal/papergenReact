import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminOcrReview() {
  const { jobId, chapterId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/ocr-result/${jobId}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || []);
        setLoading(false);
      });
  }, [jobId]);

  /* ---------- UPDATE HELPERS ---------- */

  const updateQuestion = (qIdx, field, value) => {
    const copy = [...questions];
    copy[qIdx] = { ...copy[qIdx], [field]: value };
    setQuestions(copy);
  };

  const updateSubQuestion = (qIdx, sIdx, field, value) => {
    const copy = [...questions];
    const subs = [...copy[qIdx].subQuestions];
    subs[sIdx] = { ...subs[sIdx], [field]: value };
    copy[qIdx].subQuestions = subs;
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
    setMessage(data.success ? "✅ Saved successfully" : "❌ Save failed");
    setSaving(false);
  };

  if (loading) return <p>Loading OCR results…</p>;

  return (
    <div style={{ padding: 30, background: "#f5f7fb", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: 20 }}>
        OCR Review — Job {jobId}
      </h2>

      {questions.map((q, qIdx) => (
        <div
          key={qIdx}
          style={{
            background: "#fff",
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* QUESTION */}
          <label><b>Question</b></label>
          <textarea
            value={q.questionText}
            onChange={e =>
              updateQuestion(qIdx, "questionText", e.target.value)
            }
            style={styles.textarea}
          />

          {/* QUESTION IMAGE */}
          <button style={styles.imageBtn}>
            📷 Upload Question Image
          </button>

          {/* META */}
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <div>
              <label>Marks</label>
              <input
                type="number"
                value={q.marks || ""}
                onChange={e =>
                  updateQuestion(qIdx, "marks", Number(e.target.value))
                }
                style={styles.input}
              />
            </div>

            <div>
              <label>Type</label>
              <select
                value={q.type}
                onChange={e =>
                  updateQuestion(qIdx, "type", e.target.value)
                }
                style={styles.input}
              >
                <option>Very Short</option>
                <option>Short</option>
                <option>Long</option>
                <option>Structured</option>
              </select>
            </div>
          </div>

          {/* ANSWER */}
          <div style={{ marginTop: 15 }}>
            <label><b>Answer</b></label>
            <textarea
              value={q.answer || ""}
              onChange={e =>
                updateQuestion(qIdx, "answer", e.target.value)
              }
              style={styles.textarea}
            />

            <button style={styles.imageBtn}>
              📷 Upload Answer Image
            </button>
          </div>

          {/* SUB QUESTIONS */}
          {q.subQuestions?.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4>Sub-Questions</h4>

              {q.subQuestions.map((sq, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    background: "#f9fafc",
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 10,
                  }}
                >
                  <label><b>({sq.label}) Question</b></label>
                  <textarea
                    value={sq.text}
                    onChange={e =>
                      updateSubQuestion(qIdx, sIdx, "text", e.target.value)
                    }
                    style={styles.textarea}
                  />

                  <label><b>Answer</b></label>
                  <textarea
                    value={sq.answer || ""}
                    onChange={e =>
                      updateSubQuestion(qIdx, sIdx, "answer", e.target.value)
                    }
                    style={styles.textarea}
                  />

                  <button style={styles.imageBtn}>
                    📷 Upload Sub-Question Image
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={saveQuestions}
        disabled={saving}
        style={styles.saveBtn}
      >
        {saving ? "Saving…" : "💾 Save All Questions"}
      </button>

      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  textarea: {
    width: "100%",
    minHeight: 80,
    padding: 10,
    marginTop: 6,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  input: {
    padding: 6,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  imageBtn: {
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px dashed #aaa",
    background: "#fff",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "12px 20px",
    fontSize: 16,
    borderRadius: 8,
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
  },
};
