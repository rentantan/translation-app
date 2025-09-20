import React, { useState } from "react";
import TextInput from "../components/TextInput";
import LanguageSelect from "../components/LanguageSelect";
import TranslateButton from "../components/TranslateButton";
import TranslationResult from "../components/TranslationResult";
import TranslationHistory from "../components/TranslationHistory";
import { LANGUAGES, TranslationResponse } from "../types";

interface TranslationAppProps {
  onLogout: () => void;
}

interface TranslationHistoryItem {
  id: number;
  source_text: string;
  translated_text: string;
  source_lang?: string;
  target_lang: string;
  created_at: string;
}

const TranslationApp: React.FC<TranslationAppProps> = ({ onLogout }) => {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleTranslate = async () => {
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

      if (!response.ok) {
        throw new Error("翻訳に失敗しました");
      }

      const data: TranslationResponse = await response.json();
      setTranslated(data.translated_text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "翻訳に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromHistory = (item: TranslationHistoryItem) => {
    setText(item.source_text);
    setTargetLang(item.target_lang);
    setTranslated(item.translated_text);
    setShowHistory(false);
  };

  const clearForm = () => {
    setText("");
    setTranslated("");
    setError("");
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "white",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1
            style={{
              margin: 0,
              color: "#333",
              fontSize: "2rem",
            }}
          >
            翻訳アプリ
          </h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={() => setShowHistory(true)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #2575fc",
                background: "white",
                color: "#2575fc",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "bold",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2575fc";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#2575fc";
              }}
              title="翻訳履歴を表示"
            >
              履歴
            </button>
            <button 
              onClick={clearForm}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #95a5a6",
                background: "white",
                color: "#95a5a6",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#95a5a6";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#95a5a6";
              }}
              title="入力をクリア"
            >
              クリア
            </button>
            <button 
              onClick={onLogout} 
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #e74c3c",
                background: "white",
                color: "#e74c3c",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e74c3c";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#e74c3c";
              }}
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <TextInput value={text} onChange={setText} onEnter={handleTranslate} />
        
        {error && (
          <div style={{ 
            color: "#e74c3c", 
            marginBottom: "0.5rem",
            padding: "0.5rem",
            backgroundColor: "#ffeaa7",
            borderRadius: "5px",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <LanguageSelect 
            languages={LANGUAGES} 
            value={targetLang} 
            onChange={setTargetLang} 
          />
        </div>

        <TranslateButton 
          onClick={handleTranslate} 
          loading={loading} 
          disabled={loading || !targetLang || !text.trim()} 
        />

        <TranslationResult text={translated} />

        {/* 文字数カウンター */}
        {text && (
          <div style={{ 
            textAlign: "right", 
            fontSize: "0.8rem", 
            color: "#666", 
            marginTop: "0.5rem" 
          }}>
            {text.length} 文字
          </div>
        )}
      </div>

      {/* 翻訳履歴モーダル */}
      <TranslationHistory
        isVisible={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectTranslation={handleSelectFromHistory}
      />
    </>
  );
};

export default TranslationApp;