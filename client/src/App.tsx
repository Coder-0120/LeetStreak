import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/loginPage";
import RegisterPage from "./Pages/registerPage";
import Dashboard from "./Pages/dashboard";
import HomePage from './Pages/homePage';


const App = () => {
  return (
    <div>

        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    </div>
  )
}

export default App