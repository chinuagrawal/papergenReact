function StudentDashboard() {
  const userRole = localStorage.getItem("role");

  return (
    <div className="page-container">
      <div className="card">
        <h1>👨‍🎓 Student Dashboard</h1>
        <p>Welcome! ({userRole})</p>
        <p>Here you can view question papers and practice sets.</p>
      </div>
    </div>
  );
}

export default StudentDashboard;
