// src/pages/TranslationApp.tsx
import React, { useState } from "react";
import TextInput from "../components/TextInput";
import LanguageSelect from "../components/LanguageSelect";
import TranslateButton from "../components/TranslateButton";
import TranslationResult from "../components/TranslationResult";
import { LANGUAGES, TranslationResponse } from "../types";

interface TranslationAppProps {
  onLogout: () => void;
}

const TranslationApp: React.FC<TranslationAppProps> = ({ onLogout }) => {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    // ... 以前と同じ翻訳ロジック ...
    if (!text.trim()) {
      setError("翻訳する文章を入力してください");
      return;
    }
    if (!targetLang) {
      setError("翻訳する言語を選択してください");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, target_lang: targetLang }),
      });
      const data: TranslationResponse = await response.json();
      setTranslated(data.translated_text);
    } catch (err) {
      console.error(err);
      setTranslated("翻訳に失敗しました");
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
      <h1
        style={{
          textAlign: "center",
          color: "#333",
          marginBottom: "1.5rem",
          fontSize: "2rem",
        }}
      >
        翻訳アプリ
      </h1>
      <button 
        onClick={onLogout} 
        style={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          padding: "0.5rem 1rem",
          borderRadius: "5px",
          border: "none",
          background: "white",
          color: "#2575fc",
          cursor: "pointer",
        }}
      >
        ログアウト
      </button>

      <TextInput value={text} onChange={setText} onEnter={handleTranslate} />
      {error && <div style={{ color: "red", marginBottom: "0.5rem" }}>{error}</div>}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <LanguageSelect languages={LANGUAGES} value={targetLang} onChange={setTargetLang} />
      </div>

      <TranslateButton onClick={handleTranslate} loading={loading} disabled={loading || !targetLang} />

      <TranslationResult text={translated} />
    </div>
  );
};

export default TranslationApp;