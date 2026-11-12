import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { HistoryItem, languageLabel } from "../types";
import { formatRelativeTime, useDebounce } from "../utils";

const PAGE_SIZE = 20;

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelectTranslation: (item: HistoryItem) => void;
}

const TranslationHistory: React.FC<Props> = ({ isVisible, onClose, onSelectTranslation }) => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debouncedQuery = useDebounce(query.trim(), 300);

  const load = useCallback(
    async (skip: number) => {
      setLoading(true);
      setError("");
      try {
        const page = await api.history({ skip, limit: PAGE_SIZE, q: debouncedQuery });
        setItems((prev) => (skip === 0 ? page.items : [...prev, ...page.items]));
        setTotal(page.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "履歴の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [debouncedQuery],
  );

  // 開いたとき・検索語が変わったときに先頭から読み込む
  useEffect(() => {
    if (isVisible) load(0);
  }, [isVisible, load]);

  // Esc で閉じる
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, onClose]);

  const deleteItem = async (id: number) => {
    try {
      await api.deleteHistory(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  const clearAll = async () => {
    if (!window.confirm("全ての翻訳履歴を削除しますか？この操作は元に戻せません。")) return;
    try {
      await api.clearHistory();
      setItems([]);
      setTotal(0);
      setQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "履歴の削除に失敗しました");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id="history-title" className="modal__title">
            翻訳履歴 <small style={{ fontSize: "0.9rem", color: "#888" }}>({total}件)</small>
          </h2>
          <div className="header__actions">
            {total > 0 && !debouncedQuery && (
              <button type="button" className="btn btn--danger" onClick={clearAll}>
                全削除
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>

        <input
          className="input"
          type="search"
          placeholder="🔍 原文・訳文を検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginBottom: "1rem" }}
          autoFocus
        />

        {error && <div className="alert alert--error">⚠️ {error}</div>}

        <div className="modal__body">
          {items.length === 0 && loading ? (
            <div className="empty">
              <div className="empty__icon">⏳</div>
              読み込み中...
            </div>
          ) : items.length === 0 ? (
            <div className="empty">
              <div className="empty__icon">{debouncedQuery ? "🔍" : "📝"}</div>
              {debouncedQuery ? `「${debouncedQuery}」に一致する履歴はありません` : "翻訳履歴がありません"}
              {!debouncedQuery && <div className="empty__sub">翻訳を実行すると、ここに履歴が表示されます</div>}
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="history-item"
                  role="button"
                  tabIndex={0}
                  title="クリックして再利用"
                  onClick={() => onSelectTranslation(item)}
                  onKeyDown={(e) => e.key === "Enter" && onSelectTranslation(item)}
                >
                  <div className="history-item__meta">
                    <span>
                      🕒 {formatRelativeTime(item.created_at)}　{languageLabel(item.source_lang)} →{" "}
                      {languageLabel(item.target_lang)}
                    </span>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      title="削除"
                      aria-label="この履歴を削除"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="history-item__text">{item.source_text}</div>
                  <div className="history-item__text history-item__text--translated">{item.translated_text}</div>
                </div>
              ))}

              {items.length < total && (
                <button
                  type="button"
                  className="btn btn--outline load-more"
                  onClick={() => load(items.length)}
                  disabled={loading}
                >
                  {loading ? "読み込み中..." : `さらに表示（残り ${total - items.length} 件）`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationHistory;
