import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Authpage';
import HomePage from './pages/Homepage';
import GarbageReport from './pages/GarbageReport';
import MunicipalDashboard from './pages/MunicipalDashboard';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/report-garbage" element={<GarbageReport/>} />
      <Route path="/auth" element={<AuthPage/>} />
      
      <Route path="/municipal-dashboard" element={<MunicipalDashboard/>} />
      </Routes>
    </Router>
  )
}

export default App;
