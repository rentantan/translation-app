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
    try {
      const date = new Date(dateString);
      
      // 無効な日付をチェック
      if (isNaN(date.getTime())) {
        return "無効な日付";
      }
      
      // 現在の時刻と比較して相対時間を表示
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return "たった今";
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分前`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}時間前`;
      } else if (diffInMinutes < 7 * 24 * 60) {
        const days = Math.floor(diffInMinutes / (24 * 60));
        return `${days}日前`;
      } else {
        // 1週間以上前の場合は具体的な日時を表示
        return date.toLocaleString("ja-JP", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Tokyo" // 日本時間で表示
        });
      }
    } catch (error) {
      return "日付エラー";
    }
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
      pt: "ポルトガル語",
      ru: "ロシア語",
      ar: "アラビア語",
      th: "タイ語",
      vi: "ベトナム語",
    };
    return languages[code] || code;
  };

  const getLanguageFlag = (code: string) => {
    const flags: Record<string, string> = {
      en: "🇺🇸",
      ja: "🇯🇵",
      fr: "🇫🇷", 
      es: "🇪🇸",
      de: "🇩🇪",
      it: "🇮🇹",
      ko: "🇰🇷",
      "zh-cn": "🇨🇳",
      "zh-tw": "🇹🇼",
      pt: "🇵🇹",
      ru: "🇷🇺",
      ar: "🇸🇦",
      th: "🇹🇭",
      vi: "🇻🇳",
    };
    return flags[code] || "🌐";
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
          maxWidth: "900px",
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
          <h2 style={{ margin: 0, color: "#333", fontSize: "1.8rem" }}>
            翻訳履歴 ({history.length}件)
          </h2>
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
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#c0392b"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#e74c3c"}
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
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#7f8c8d"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#95a5a6"}
            >
              閉じる
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            color: "#e74c3c", 
            marginBottom: "1rem", 
            padding: "0.75rem", 
            backgroundColor: "#ffeaa7", 
            borderRadius: "8px",
            border: "1px solid #f39c12"
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
              読み込み中...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
              翻訳履歴がありません
              <div style={{ fontSize: "0.9rem", marginTop: "0.5rem", color: "#999" }}>
                翻訳を実行すると、ここに履歴が表示されます
              </div>
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
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (onSelectTranslation) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.borderColor = "#3498db";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onSelectTranslation) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#e0e0e0";
                    }
                  }}
                  onClick={() => onSelectTranslation && onSelectTranslation(item)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "#666", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>🕒 {formatDate(item.created_at)}</span>
                      <span>|</span>
                      <span>
                        {getLanguageFlag(item.source_lang || "auto")} {getLanguageName(item.source_lang || "auto")} 
                        → {getLanguageFlag(item.target_lang)} {getLanguageName(item.target_lang)}
                      </span>
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
                        fontSize: "1.2rem",
                        padding: "0.2rem",
                        borderRadius: "4px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fee";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      title="削除"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.25rem", fontWeight: "600" }}>
                      📄 原文:
                    </div>
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
                      border: "1px solid #e8e8e8",
                    }}>
                      {item.source_text}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.25rem", fontWeight: "600" }}>
                      🌐 翻訳結果:
                    </div>
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
                      border: "1px solid #d6eaf8",
                    }}>
                      {item.translated_text}
                    </div>
                  </div>
                  
                  {onSelectTranslation && (
                    <div style={{
                      position: "absolute",
                      bottom: "0.5rem",
                      right: "0.5rem",
                      fontSize: "0.8rem",
                      color: "#3498db",
                      opacity: 0.7,
                    }}>
                      クリックして再利用 →
                    </div>
                  )}
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