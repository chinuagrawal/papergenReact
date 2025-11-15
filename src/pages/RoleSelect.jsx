import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API_URL;

function RoleSelect() {
  const navigate = useNavigate();

  const handleSelect = async (role) => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return navigate("/");

    const res = await fetch(`${API}/api/save-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, role }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("userRole", role);
      navigate(role === "teacher" ? "/teacher" : "/student");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1>Select Your Role</h1>
        <div className="button-group">
          <button onClick={() => handleSelect("teacher")}>👨‍🏫 Teacher</button>
          <button onClick={() => handleSelect("student")}>👨‍🎓 Student</button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;
