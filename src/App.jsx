import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Admin from './pages/Admin';
import RoleSelect from "./pages/RoleSelect";
import TeacherDashboard from "./pages/TeacherDashboard";
import BooksPage from "./pages/booksPage";
import StudentDashboard from "./pages/StudentDashboard";
import OtpLogin from "./pages/OtpLogin";
import Loginpage from "./pages/Loginpage";
import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/papergenReact">
      <Routes>
        <Route path="/" element={<OtpLogin />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/Login" element={<Loginpage />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/selectedBooks" element={<BooksPage />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
