import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return navigate("/");

    fetch(`${API}/api/get-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        else navigate("/");
      });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user)
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
          <span className="text-gray-600 font-medium text-lg">
            Loading Dashboard...
          </span>
        </div>
      </div>
    );

  return (
    <div className="max-w-md mx-auto bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full text-center border border-gray-100">
        <span className="text-6xl block mb-4">👨‍🎓</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {user.mobile}</p>
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
