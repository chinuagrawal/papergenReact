import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return navigate("/");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full text-center border border-gray-100">
        <span className="text-6xl block mb-4">👨‍🎓</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Student Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Welcome, {localStorage.getItem("userMobile")}
        </p>
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default StudentDashboard;
