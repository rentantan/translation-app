import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { api, clearToken, getToken, setToken, UNAUTHORIZED_EVENT } from "./api";
import LoginForm from "./pages/LoginForm";
import RegistrationForm from "./pages/RegistrationForm";
import TranslationApp from "./pages/TranslationApp";
import type { User } from "./types";

const App: React.FC = () => {
  const [token, setTokenState] = useState<string | null>(getToken);
  const [user, setUser] = useState<User | null>(null);
  const [sessionMessage, setSessionMessage] = useState("");

  const handleLogin = useCallback((accessToken: string) => {
    setToken(accessToken);
    setTokenState(accessToken);
    setSessionMessage("");
  }, []);

  const handleLogout = useCallback((message = "") => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setSessionMessage(message);
  }, []);

  // トークンが有効か確認してユーザー情報を取得
  useEffect(() => {
    if (!token) return;
    api.me().then(setUser).catch(() => {
      /* 401 は UNAUTHORIZED_EVENT 経由で処理される */
    });
  }, [token]);

  // API が 401 を返したら（トークン期限切れなど）ログアウト
  useEffect(() => {
    const onUnauthorized = () =>
      handleLogout("ログインの有効期限が切れました。再度ログインしてください。");
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [handleLogout]);

  const isLoggedIn = Boolean(token);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <LoginForm onLogin={handleLogin} notice={sessionMessage} />
              )
            }
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/" replace /> : <RegistrationForm onLogin={handleLogin} />}
          />
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <TranslationApp user={user} onLogout={() => handleLogout()} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
