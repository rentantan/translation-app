import React, { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useDebounce } from "../hooks/useDebounce";
import { formatRelativeTime } from "../lib/format";
import { languageLabel } from "../lib/languages";
import type { HistoryItem } from "../types";

const PAGE_SIZE = 20;

/** 削除を取り消せる時間（ミリ秒） */
const UNDO_MS = 5000;

type PendingDelete = { item: HistoryItem; index: number; timer: ReturnType<typeof setTimeout> };

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
  const [undoItem, setUndoItem] = useState<HistoryItem | null>(null);
  const debouncedQuery = useDebounce(query.trim(), 300);
  // 取り消し待ちの削除と、サーバーで削除中の ID（再読み込みで復活して見えないように除外する）
  const pending = useRef<PendingDelete | null>(null);
  const deletingIds = useRef(new Set<number>());

  const load = useCallback(
    async (skip: number) => {
      setLoading(true);
      setError("");
      try {
        const page = await api.history({ skip, limit: PAGE_SIZE, q: debouncedQuery });
        const visible = page.items.filter((i) => !deletingIds.current.has(i.id));
        setItems((prev) => (skip === 0 ? visible : [...prev, ...visible]));
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

  // 開いている間: Esc で閉じる・背景をスクロールさせない・閉じたら元の場所にフォーカスを戻す
  useEffect(() => {
    if (!isVisible) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isVisible, onClose]);

  /** サーバーで実際に削除する。失敗したら一覧に戻す */
  const commitDelete = useCallback(async ({ item, index }: Omit<PendingDelete, "timer">) => {
    deletingIds.current.add(item.id);
    try {
      await api.deleteHistory(item.id);
    } catch (err) {
      setItems((prev) => [...prev.slice(0, index), item, ...prev.slice(index)]);
      setTotal((t) => t + 1);
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      deletingIds.current.delete(item.id);
    }
  }, []);

  /** 取り消し待ちの削除があれば、待たずに確定する */
  const flushPending = useCallback(() => {
    const current = pending.current;
    if (!current) return;
    clearTimeout(current.timer);
    pending.current = null;
    setUndoItem(null);
    commitDelete(current);
  }, [commitDelete]);

  // 閉じたとき・画面を離れるときは取り消し待ちの削除を確定する
  useEffect(() => {
    if (!isVisible) flushPending();
  }, [isVisible, flushPending]);
  useEffect(() => flushPending, [flushPending]);

  const deleteItem = (item: HistoryItem) => {
    flushPending();
    const index = items.findIndex((i) => i.id === item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setTotal((t) => t - 1);
    const timer = setTimeout(flushPending, UNDO_MS);
    pending.current = { item, index, timer };
    setUndoItem(item);
  };

  const undoDelete = () => {
    const current = pending.current;
    if (!current) return;
    clearTimeout(current.timer);
    pending.current = null;
    setUndoItem(null);
    setItems((prev) => [...prev.slice(0, current.index), current.item, ...prev.slice(current.index)]);
    setTotal((t) => t + 1);
  };

  const clearAll = async () => {
    if (!window.confirm("全ての翻訳履歴を削除しますか？この操作は元に戻せません。")) return;
    if (pending.current) {
      clearTimeout(pending.current.timer);
      pending.current = null;
      setUndoItem(null);
    }
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
            翻訳履歴 <small className="modal__count">({total}件)</small>
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
          className="input modal__search"
          type="search"
          placeholder="🔍 原文・訳文を検索"
          aria-label="履歴を検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
                <div key={item.id} className="history-item">
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
                      onClick={() => deleteItem(item)}
                    >
                      ✕
                    </button>
                  </div>
                  <button
                    type="button"
                    className="history-item__body"
                    title="クリックして再利用"
                    onClick={() => onSelectTranslation(item)}
                  >
                    <span className="history-item__text">{item.source_text}</span>
                    <span className="history-item__text history-item__text--translated">{item.translated_text}</span>
                  </button>
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

        {undoItem && (
          <div className="undo-bar" role="status">
            <span>履歴を削除しました</span>
            <button type="button" className="btn btn--outline" onClick={undoDelete}>
              元に戻す
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationHistory;
