import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import PasswordInput from "../components/PasswordInput";

interface LoginFormProps {
  onLogin: (token: string) => void;
  notice?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, notice }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await api.login(username.trim(), password);
      onLogin(access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
      setLoading(false);
    }
  };

  return (
    <form className="card card--narrow" onSubmit={handleSubmit}>
      <h2 className="card__title">ログイン</h2>

      {(error || notice) && <div className="alert alert--error">{error || notice}</div>}

      <label className="field">
        <span className="field__label">ユーザー名</span>
        <input
          className="input"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">パスワード</span>
        <PasswordInput
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? "ログイン中..." : "ログイン"}
      </button>

      <p className="form-footer">
        アカウントをお持ちでないですか？ <Link to="/register">新規登録</Link>
      </p>
    </form>
  );
};

export default LoginForm;
