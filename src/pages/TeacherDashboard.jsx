import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SUBJECTS } from "../data/subjects";
const API = import.meta.env.VITE_API_URL;


function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ---- Dashboard form states ----
  const [board, setBoard] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [bookTypes, setBookTypes] = useState([]);

  const [availableSubjects, setAvailableSubjects] = useState([]);

  // ---- Check login ----
  useEffect(() => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return navigate("/");

    axios
      .post(`${API}/api/get-user`, { mobile })
      .then((res) => {
        if (res.data.success) setUser(res.data.user);
        else navigate("/");
      })
      .catch(() => navigate("/"));
  }, []);

  // ---- Update subjects when class changes ----
  useEffect(() => {
    if (className) setAvailableSubjects(SUBJECTS[className] || []);
    else setAvailableSubjects([]);

    setSubject("");
  }, [className]);

  const handleBookTypeToggle = (type) => {
    if (bookTypes.includes(type)) {
      setBookTypes(bookTypes.filter((b) => b !== type));
    } else {
      setBookTypes([...bookTypes, type]);
    }
  };

  // ---- Submit selection ----
  const handleSubmit = async () => {
    if (!board || !className || !subject || !bookTypes.length)
      return alert("Please fill all fields");

    await axios.post(`${API}/api/save-selection`, {

      teacher: user.mobile,
      board,
      className,
      subject,
      bookTypes,
    });

    navigate("/selectedBooks", {
  state: {
    board,
    className,
    subject,
    bookTypes,
    teacher: user.mobile
  }
});
 // page 2: chapters will be there
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user)
    return (
      <h3 className="text-center mt-10 text-gray-600 tracking-wide">
        Loading...
      </h3>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9d5ff] to-[#dbeafe] flex justify-center p-5">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
        {/* HEADER */}
        <h2 className="text-3xl font-bold text-center mb-2 text-purple-700">
          Teacher Dashboard
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Welcome, <span className="font-semibold">{user.mobile}</span>
        </p>

        {/* FORM UI */}
        <div className="space-y-5">
          {/* BOARD */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Board
            </label>
            <select
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="w-full p-3 border rounded-xl shadow-sm bg-gray-50 focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Choose Board</option>
              <option value="CBSE">CBSE</option>
              <option value="RBSE">RBSE</option>
            </select>
          </div>

          {/* CLASS */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Class
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full p-3 border rounded-xl shadow-sm bg-gray-50 focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Choose Class</option>
              <option>9th Class</option>
              <option>10th Class</option>
              <option>11th Science</option>
              <option>11th Commerce</option>
              <option>11th Humanities</option>
              <option>12th Science</option>
              <option>12th Commerce</option>
              <option>12th Humanities</option>
            </select>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!availableSubjects.length}
              className="w-full p-3 border rounded-xl shadow-sm bg-gray-50 focus:ring-2 focus:ring-purple-400 disabled:bg-gray-100"
            >
              <option value="">Choose Subject</option>
              {availableSubjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* BOOK TYPE */}
          <div>
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Select Book Type
            </label>

            <div className="flex flex-wrap gap-3">
              {[
                "NCERT",
                "NCERT Exemplar",
                "Question Bank",
                "PYQs",
                "Sample Papers",
                "Board Papers",
              ].map((b) => (
                <button
                  key={b}
                  onClick={() => handleBookTypeToggle(b)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border shadow-sm transition-all ${
                    bookTypes.includes(b)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-gray-50 text-gray-700 border-gray-300"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          className="mt-7 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          Continue ➜
        </button>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default TeacherDashboard;
