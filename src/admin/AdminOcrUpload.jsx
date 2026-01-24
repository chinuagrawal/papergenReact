import { useEffect, useState } from "react";
import { api } from "../services/masterDataApi";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminOcrUpload() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [boardId, setBoardId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [bookId, setBookId] = useState("");
  const [chapterId, setChapterId] = useState("");

  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [fileName, setFileName] = useState("");

  /* ---------------- TOAST NOTIFICATION ---------------- */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoadingData(true);
        const data = await api.getBoards();
        setBoards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch boards:", err);
        showToast("Failed to load boards. Please check your connection.", "error");
        setBoards([]);
      } finally {
        setLoadingData(false);
      }
    };
    fetchBoards();
  }, []);

  useEffect(() => {
    if (boardId) {
      const fetchClasses = async () => {
        try {
          const data = await api.getClasses(boardId);
          setClasses(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch classes:", err);
          showToast("Failed to load classes.", "error");
          setClasses([]);
        }
      };
      fetchClasses();
      setClassId("");
      setSubjectId("");
      setBookId("");
      setChapterId("");
    } else {
      setClasses([]);
    }
  }, [boardId]);

  useEffect(() => {
    if (classId) {
      const fetchSubjects = async () => {
        try {
          const data = await api.getSubjects(classId);
          setSubjects(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch subjects:", err);
          showToast("Failed to load subjects.", "error");
          setSubjects([]);
        }
      };
      fetchSubjects();
      setSubjectId("");
      setBookId("");
      setChapterId("");
    } else {
      setSubjects([]);
    }
  }, [classId]);

  useEffect(() => {
    if (subjectId) {
      const fetchBooks = async () => {
        try {
          const data = await api.getBooks(subjectId);
          setBooks(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch books:", err);
          showToast("Failed to load books.", "error");
          setBooks([]);
        }
      };
      fetchBooks();
      setBookId("");
      setChapterId("");
    } else {
      setBooks([]);
    }
  }, [subjectId]);

  useEffect(() => {
    if (bookId) {
      const fetchChapters = async () => {
        try {
          const data = await api.getChapters(bookId);
          setChapters(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch chapters:", err);
          showToast("Failed to load chapters.", "error");
          setChapters([]);
        }
      };
      fetchChapters();
      setChapterId("");
    } else {
      setChapters([]);
    }
  }, [bookId]);

  /* ---------------- FILE HANDLER ---------------- */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        showToast("Please select a PDF file.", "error");
        e.target.value = "";
        setFileName("");
        return;
      }
      setFileName(file.name);
    }
  };

  /* ---------------- UPLOAD ---------------- */
  const uploadPdf = async () => {
    const file = fileRef.current?.files?.[0];

    if (!chapterId) {
      showToast("Please select a chapter.", "error");
      return;
    }

    if (!file) {
      showToast("Please select a PDF file.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("chapterId", chapterId);
    formData.append("pdf", file);

    setLoading(true);
    setMessage("");
    showToast("Uploading PDF...", "success");

    try {
      const res = await fetch(`${API}/api/admin/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        showToast("✅ PDF uploaded successfully! Starting OCR...", "success");
        setTimeout(() => {
          navigate(`/admin/ocr-review/${data.jobId}/${chapterId}`);
        }, 1000);
      } else {
        showToast("❌ Upload failed. Please try again.", "error");
        setMessage(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      showToast(`❌ ${err.message || "Server error. Please try again."}`, "error");
      setMessage(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
            : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{toast.type === "success" ? "✓" : "✕"}</span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Upload PDF for OCR
          </h1>
          <p className="text-gray-600">
            Select board, class, subject, book, and chapter, then upload your PDF file
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          {loadingData ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading master data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Board Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Board <span className="text-red-500">*</span>
                </label>
                <select
                  value={boardId}
                  onChange={e => setBoardId(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium bg-white"
                >
                  <option value="">Select Board</option>
                  {boards.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={classId}
                  onChange={e => setClassId(e.target.value)}
                  disabled={!boardId}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium ${
                    !boardId 
                      ? "border-gray-200 bg-gray-100 cursor-not-allowed" 
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  disabled={!classId}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium ${
                    !classId 
                      ? "border-gray-200 bg-gray-100 cursor-not-allowed" 
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Book Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Book <span className="text-red-500">*</span>
                </label>
                <select
                  value={bookId}
                  onChange={e => setBookId(e.target.value)}
                  disabled={!subjectId}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium ${
                    !subjectId 
                      ? "border-gray-200 bg-gray-100 cursor-not-allowed" 
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <option value="">Select Book</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chapter <span className="text-red-500">*</span>
                </label>
                <select
                  value={chapterId}
                  onChange={e => setChapterId(e.target.value)}
                  disabled={!bookId}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium ${
                    !bookId 
                      ? "border-gray-200 bg-gray-100 cursor-not-allowed" 
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <option value="">Select Chapter</option>
                  {chapters.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      {ch.chapter_number}. {ch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PDF File <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    ref={fileRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 bg-white"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF only</p>
                    </div>
                  </label>
                </div>
                {fileName && (
                  <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <span>✓</span>
                      <span className="font-medium">{fileName}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {message && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  onClick={uploadPdf}
                  disabled={loading || !chapterId || !fileName}
                  className={`w-full px-6 py-3 rounded-xl font-semibold shadow-lg transform transition-all duration-200 ${
                    loading || !chapterId || !fileName
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-xl hover:scale-[1.02]"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Uploading & Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>📤</span>
                      <span>Upload & Start OCR</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
