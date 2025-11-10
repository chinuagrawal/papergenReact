function TeacherDashboard() {
  const userRole = localStorage.getItem("role");

  return (
    <div className="page-container">
      <div className="card">
        <h1>👨‍🏫 Teacher Dashboard</h1>
        <p>Welcome! ({userRole})</p>
        <p>Here you can upload PDFs, extract questions, and create papers.</p>
      </div>
    </div>
  );
}

export default TeacherDashboard;
