import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const mobile = localStorage.getItem("userMobile");
    if (!mobile) return navigate("/");

    fetch("http://localhost:5000/api/get-user", {
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

  if (!user) return <h3>Loading...</h3>;

  return (
    <div className="page-container">
      <div className="card">
        <h1>👨‍🎓 Student Dashboard</h1>
        <p>Welcome, {user.mobile}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default StudentDashboard;
