import React, { useState } from "react";
import { api } from "../api";
import LanguageSelect from "../components/LanguageSelect";
import TextInput from "../components/TextInput";
import TranslationHistory from "../components/TranslationHistory";
import TranslationResult from "../components/TranslationResult";
import { AUTO_DETECT, findLanguage, HistoryItem, LANGUAGES, MAX_TEXT_LENGTH, User } from "../types";
import { copyToClipboard, usePersistentState, useToast } from "../utils";

interface TranslationAppProps {
  user: User | null;
  onLogout: () => void;
}

const TranslationApp: React.FC<TranslationAppProps> = ({ user, onLogout }) => {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [resultLang, setResultLang] = useState("");
  // 言語の選択は次回も引き継ぐ
  const [sourceLang, setSourceLang] = usePersistentState("sourceLang", AUTO_DETECT);
  const [targetLang, setTargetLang] = usePersistentState("targetLang", "en");
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const toast = useToast();

  const tooLong = text.length > MAX_TEXT_LENGTH;
  const canTranslate = !loading && Boolean(text.trim()) && !tooLong;

  const handleTranslate = async () => {
    if (!canTranslate) {
      if (tooLong) setError(`${MAX_TEXT_LENGTH.toLocaleString()}文字以内で入力してください`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await api.translate(text, targetLang, sourceLang);
      setTranslated(data.translated_text);
      setResultLang(targetLang);
      setDetectedLang(data.source_lang);
    } catch (err) {
      setError(err instanceof Error ? err.message : "翻訳に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 入れ替え先の翻訳元言語（自動検出なら検出結果を使う）
  const effectiveSource = sourceLang === AUTO_DETECT ? detectedLang : sourceLang;
  const canSwap = Boolean(findLanguage(effectiveSource)) && effectiveSource !== targetLang;

  const handleSwap = () => {
    if (!canSwap || !effectiveSource) return;
    setSourceLang(targetLang);
    setTargetLang(effectiveSource);
    if (translated) {
      setText(translated);
      setTranslated(text);
      setResultLang(effectiveSource);
    }
    setDetectedLang(null);
  };

  const handleSelectFromHistory = (item: HistoryItem) => {
    setText(item.source_text);
    setTranslated(item.translated_text);
    setResultLang(item.target_lang);
    setTargetLang(item.target_lang);
    setSourceLang(AUTO_DETECT);
    setDetectedLang(item.source_lang ?? null);
    setError("");
    setShowHistory(false);
  };

  const handleCopy = async (value: string) => {
    toast.show((await copyToClipboard(value)) ? "コピーしました" : "コピーできませんでした");
  };

  const clearForm = () => {
    setText("");
    setTranslated("");
    setDetectedLang(null);
    setError("");
  };

  return (
    <>
      <main className="card">
        <header className="header">
          <div>
            <h1 className="header__title">翻訳アプリ</h1>
            {user && <div className="header__user">👤 {user.username}</div>}
          </div>
          <div className="header__actions">
            <button type="button" className="btn btn--outline" onClick={() => setShowHistory(true)}>
              🕒 履歴
            </button>
            <button type="button" className="btn btn--ghost" onClick={clearForm} disabled={!text && !translated}>
              クリア
            </button>
            <button type="button" className="btn btn--danger" onClick={onLogout}>
              ログアウト
            </button>
          </div>
        </header>

        <div className="lang-bar">
          <LanguageSelect
            label="翻訳元の言語"
            languages={LANGUAGES}
            value={sourceLang}
            onChange={(v) => {
              setSourceLang(v);
              setDetectedLang(null);
            }}
            allowAuto
            detected={detectedLang}
          />
          <button
            type="button"
            className="swap-btn"
            onClick={handleSwap}
            disabled={!canSwap}
            title={canSwap ? "言語を入れ替え" : "翻訳元の言語が決まると入れ替えできます"}
            aria-label="言語を入れ替え"
          >
            ⇄
          </button>
          <LanguageSelect label="翻訳先の言語" languages={LANGUAGES} value={targetLang} onChange={setTargetLang} />
        </div>

        <TextInput value={text} onChange={setText} onEnter={handleTranslate} />

        {error && (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        )}

        <button type="button" className="btn btn--primary" onClick={handleTranslate} disabled={!canTranslate}>
          {loading ? "翻訳中..." : "翻訳する"}
        </button>

        <TranslationResult text={translated} targetLang={resultLang} onCopy={handleCopy} />
      </main>

      <TranslationHistory
        isVisible={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectTranslation={handleSelectFromHistory}
      />

      {toast.message && <div className="toast">{toast.message}</div>}
    </>
  );
};

export default TranslationApp;
