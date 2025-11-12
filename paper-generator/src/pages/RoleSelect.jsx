import { useNavigate } from "react-router-dom";

function RoleSelect() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    localStorage.setItem("role", role);
    if (role === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/student");
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
