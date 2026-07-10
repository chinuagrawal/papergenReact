import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import HomePage from "./pages/HomePage";
import RoleSelect from "./pages/RoleSelect";
import TeacherDashboard from "./pages/TeacherDashboard";
import BooksPage from "./pages/booksPage";
import StudentDashboard from "./pages/StudentDashboard";
import OtpLogin from "./pages/OtpLogin";
import Loginpage from "./pages/Loginpage";
import AdminReviewPanel from "./pages/AdminReviewPanel";
import "./App.css";
import AdminMasterData from "./admin/AdminMasterData";
import AdminOcrUpload from "./admin/AdminOcrUpload";
import AdminOcrReview from "./admin/AdminOcrReview";
import PaperGeneration from "./pages/PaperGeneration";
import ManualPaperSelection from "./pages/ManualPaperSelection";

const API = import.meta.env.VITE_API_URL;

function App() {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) {
        setRedirectTo("/home");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post(`${API}/api/get-user`, { mobile });
        const role = res.data.user?.role;

        if (role === "teacher") {
          setRedirectTo("/teacher");
        } else if (role === "student") {
          setRedirectTo("/student");
        } else {
          setRedirectTo("/role");
        }
      } catch {
        localStorage.clear();
        setRedirectTo("/home");
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="text-center space-y-4">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-[#003d9b]"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gray-600 font-medium text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Navigate to={redirectTo} replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<OtpLogin />} />
        <Route path="/admin/review" element={<AdminReviewPanel />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/Login" element={<Loginpage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/selectedBooks" element={<BooksPage />} />
        <Route path="/generate-paper" element={<PaperGeneration />} />
        <Route
          path="/manual-paper-selection"
          element={<ManualPaperSelection />}
        />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin/master" element={<AdminMasterData />} />
        <Route path="/admin/ocr-upload" element={<AdminOcrUpload />} />
        <Route
          path="/admin/ocr-review/:jobId/:chapterId"
          element={<AdminOcrReview />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
