import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Admin from './pages/Admin';
import RoleSelect from "./pages/RoleSelect";

import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import OtpLogin from "./pages/OtpLogin"; // ✅ import new page
import Loginpage from "./pages/Loginpage"; // ✅ import new page

import "./App.css";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        
        
        <Route path="/" element={<OtpLogin />} />
        <Route path="/Login" element={<Loginpage />} />
        <Route path="/role" element={<RoleSelect />} />
       
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
