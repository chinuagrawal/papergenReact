import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect";
import InstitutionForm from "./pages/InstitutionForm";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/institution" element={<InstitutionForm />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



