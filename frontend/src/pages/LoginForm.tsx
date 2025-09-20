import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // データをURLSearchParams形式に変換
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          // コンテンツタイプをフォームデータに変更
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // データをURLSearchParamsとして送信
        body: formData.toString(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "ログインに失敗しました。");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      onLogin();
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("ログイン中に予期せぬエラーが発生しました。");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        background: "white",
        borderRadius: "20px",
        padding: "2rem",
        boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#333",
          marginBottom: "1.5rem",
          fontSize: "2rem",
        }}
      >
        ログイン
      </h2>
      {error && (
        <div style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}>
          {error}
        </div>
      )}
      <input
        type="text"
        placeholder="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          width: "calc(100% - 2rem)",
          padding: "1rem",
          marginBottom: "1rem",
          borderRadius: "10px",
          border: "1px solid #ddd",
          fontSize: "1rem",
        }}
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "calc(100% - 2rem)",
          padding: "1rem",
          marginBottom: "1.5rem",
          borderRadius: "10px",
          border: "1px solid #ddd",
          fontSize: "1rem",
        }}
      />
      
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "1rem",
          border: "none",
          borderRadius: "10px",
          background: loading ? "#a0a0a0" : "#2575fc",
          color: "white",
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.3s ease",
          boxShadow: loading ? "none" : "0 4px 10px rgba(37, 117, 252, 0.3)",
        }}
      >
        {loading ? "ログイン中..." : "ログイン"}
      </button>

      <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#666" }}>
        アカウントをお持ちでないですか？{" "}
        <Link to="/register" style={{ color: "#2575fc", textDecoration: "none", fontWeight: "bold" }}>
          新規登録
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
