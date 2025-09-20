import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import TranslationApp from "./pages/TranslationApp";
import LoginForm from "./pages/LoginForm";
import RegistrationForm from "./pages/RegistrationForm";

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 現在のパスが /register の場合は、ログインチェックをスキップ
    if (location.pathname === "/register") {
      return;
    }
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      navigate("/");
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
  }, [navigate, location.pathname]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        fontFamily: '"Segoe UI", sans-serif',
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="/register" element={<RegistrationForm />} />
        
        {/* ログインが必要なルート */}
        <Route path="/" element={
          isLoggedIn ? (
            <TranslationApp onLogout={handleLogout} />
          ) : (
            <div style={{ color: 'white', textAlign: 'center' }}>
              <h1>ログインしてください</h1>
              <p>翻訳アプリを利用するにはログインが必要です。</p>
              <p style={{ marginTop: '1rem' }}>
                <Link 
                  to="/login" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'underline', 
                    fontWeight: 'bold' 
                  }}
                >
                  ログインページへ
                </Link>
              </p>
            </div>
          )
        } />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;