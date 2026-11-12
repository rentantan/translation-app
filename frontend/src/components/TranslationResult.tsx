import React from "react";
import { languageLabel } from "../types";

type Props = {
  text: string;
  targetLang: string;
  onCopy: (text: string) => void;
};

const TranslationResult: React.FC<Props> = ({ text, targetLang, onCopy }) => {
  if (!text) return null;
  return (
    <section className="result" aria-live="polite">
      <div className="result__header">
        <span>翻訳結果（{languageLabel(targetLang)}）</span>
        <button type="button" className="icon-btn" onClick={() => onCopy(text)} title="翻訳結果をコピー">
          📋 コピー
        </button>
      </div>
      <div className="result__body">{text}</div>
    </section>
  );
};

export default TranslationResult;
