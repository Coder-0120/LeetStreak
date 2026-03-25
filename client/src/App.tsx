import React from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/loginPage";
import RegisterPage from "./Pages/registerPage";
import Dashboard from "./Pages/dashboard";
import HomePage from "./Pages/homePage";
import AdminLogin from "./Pages/adminLogin";
import AdminDashboard from "./Pages/adminDashboard";

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  </Router>
);

export default App;