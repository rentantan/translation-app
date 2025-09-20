import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegistrationForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "新規登録に失敗しました。");
      }

      console.log("新規登録に成功しました");
      navigate("/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("新規登録中に予期せぬエラーが発生しました。");
      }
      console.error("Registration error:", err);
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
        新規登録
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
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: "1rem",
          border: "none",
          borderRadius: "10px",
          background: loading ? "#a0a0a0" : "#6a11cb",
          color: "white",
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background-color 0.3s ease",
          boxShadow: loading ? "none" : "0 4px 10px rgba(106, 17, 203, 0.3)",
        }}
      >
        {loading ? "登録中..." : "登録"}
      </button>

      <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#666" }}>
        アカウントをお持ちですか？{" "}
        <Link to="/login" style={{ color: "#6a11cb", textDecoration: "none", fontWeight: "bold" }}>
          ログイン
        </Link>
      </p>
    </div>
  );
};

export default RegistrationForm;