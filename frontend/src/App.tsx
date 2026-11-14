import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import LoginForm from "./pages/LoginForm";
import RegistrationForm from "./pages/RegistrationForm";
import TranslationApp from "./pages/TranslationApp";

const App: React.FC = () => {
  const { isLoggedIn, user, sessionMessage, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/" replace /> : <LoginForm onLogin={login} notice={sessionMessage} />}
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/" replace /> : <RegistrationForm onLogin={login} />}
          />
          <Route
            path="/"
            element={
              isLoggedIn ? <TranslationApp user={user} onLogout={() => logout()} /> : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
