import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ScanPage from "./pages/ScanPage";
import FindItem from "./pages/FindItem";
import Login from "./pages/Login";
// import VintedBot from "./pages/VintedBot"; // Removed

function App() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem("loggedIn"));
  const handleLogin = () => {
    localStorage.setItem("loggedIn", "1");
    setLoggedIn(true);
  };
  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setLoggedIn(false);
  };

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 ml-56">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/find-item" element={<FindItem />} />
            {/* <Route path="/vinted-bot" element={<VintedBot />} /> */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
