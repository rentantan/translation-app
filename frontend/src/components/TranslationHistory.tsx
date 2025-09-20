import React, { useState, useEffect } from "react";

interface TranslationHistoryItem {
  id: number;
  source_text: string;
  translated_text: string;
  source_lang?: string;
  target_lang: string;
  created_at: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelectTranslation?: (item: TranslationHistoryItem) => void;
}

const TranslationHistory: React.FC<Props> = ({ isVisible, onClose, onSelectTranslation }) => {
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/translations/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("履歴の取得に失敗しました");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTranslation = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/translations/history/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }

      // 履歴を再取得
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("全ての翻訳履歴を削除しますか？この操作は元に戻せません。")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/translations/history", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("履歴の削除に失敗しました");
      }

      setHistory([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      en: "英語",
      ja: "日本語",
      fr: "フランス語",
      es: "スペイン語",
      de: "ドイツ語",
      it: "イタリア語",
      ko: "韓国語",
      "zh-cn": "中国語（簡体）",
      "zh-tw": "中国語（繁体）",
    };
    return languages[code] || code;
  };

  useEffect(() => {
    if (isVisible) {
      fetchHistory();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "2rem",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#333", fontSize: "1.8rem" }}>翻訳履歴</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {history.length > 0 && (
              <button
                onClick={clearAllHistory}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "8px",
                  background: "#e74c3c",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                全削除
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "8px",
                background: "#95a5a6",
                color: "white",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              閉じる
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: "#e74c3c", marginBottom: "1rem", padding: "0.5rem", backgroundColor: "#ffeaa7", borderRadius: "5px" }}>
            {error}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
              読み込み中...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
              翻訳履歴がありません
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {history.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    cursor: onSelectTranslation ? "pointer" : "default",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (onSelectTranslation) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onSelectTranslation) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                  onClick={() => onSelectTranslation && onSelectTranslation(item)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {formatDate(item.created_at)} | {getLanguageName(item.source_lang || "auto")} → {getLanguageName(item.target_lang)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTranslation(item.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e74c3c",
                        cursor: "pointer",
                        fontSize: "1rem",
                        padding: "0.2rem",
                        borderRadius: "4px",
                      }}
                      title="削除"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.25rem" }}>原文:</div>
                    <div style={{ 
                      backgroundColor: "white", 
                      padding: "0.75rem", 
                      borderRadius: "8px", 
                      fontSize: "0.95rem",
                      maxHeight: "60px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {item.source_text}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.25rem" }}>翻訳結果:</div>
                    <div style={{ 
                      backgroundColor: "#e8f4fd", 
                      padding: "0.75rem", 
                      borderRadius: "8px", 
                      fontSize: "0.95rem",
                      maxHeight: "60px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {item.translated_text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationHistory;