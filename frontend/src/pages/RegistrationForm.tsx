import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import PasswordInput from "../components/PasswordInput";

interface RegistrationFormProps {
  onLogin: (token: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // 確認欄が入力され始めたら一致しているかをその場で表示する
  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const name = username.trim();
      await api.register(name, password);
      // 登録後はそのままログインする
      const { access_token } = await api.login(name, password);
      onLogin(access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "新規登録に失敗しました");
      setLoading(false);
    }
  };

  return (
    <form className="card card--narrow" onSubmit={handleSubmit}>
      <h2 className="card__title">新規登録</h2>

      {error && <div className="alert alert--error">{error}</div>}

      <label className="field">
        <span className="field__label">ユーザー名（3〜32文字）</span>
        <input
          className="input"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={32}
          required
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">パスワード（6文字以上）</span>
        <PasswordInput
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          maxLength={128}
          required
        />
      </label>

      <label className="field">
        <span className="field__label">パスワード（確認）</span>
        <PasswordInput
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          invalid={mismatch}
          required
        />
        {mismatch && <span className="field__error">パスワードが一致しません</span>}
      </label>

      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? "登録中..." : "登録してはじめる"}
      </button>

      <p className="form-footer">
        アカウントをお持ちですか？ <Link to="/login">ログイン</Link>
      </p>
    </form>
  );
};

export default RegistrationForm;
