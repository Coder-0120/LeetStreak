import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './Pages/loginPage.jsx';
import RegisterPage from './Pages/registerPage.jsx';
import HomePage from './Pages/homePage.jsx';
import Dashboard from './Pages/dashboard';

const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App