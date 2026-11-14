import React from "react";

type Props = {
  text: string;
  loading: boolean;
  /** 入力や翻訳先が変わり、表示中の結果が古くなっているか */
  stale: boolean;
  onCopy: (text: string) => void;
};

const TranslationResult: React.FC<Props> = ({ text, loading, stale, onCopy }) => (
  <section className={`pane pane--result${stale || loading ? " pane--stale" : ""}`} aria-live="polite" aria-busy={loading}>
    <div className="pane__body pane__result">
      {loading && !text ? (
        <span className="pane__placeholder">
          <span className="spinner" aria-hidden="true" /> 翻訳中...
        </span>
      ) : text ? (
        text
      ) : (
        <span className="pane__placeholder">翻訳結果がここに表示されます</span>
      )}
    </div>
    <div className="input-meta">
      <span>{loading && text ? "翻訳中..." : stale ? "入力が変更されています（Enter で再翻訳）" : ""}</span>
      {text && (
        <button type="button" className="icon-btn" onClick={() => onCopy(text)} title="翻訳結果をコピー">
          📋 コピー
        </button>
      )}
    </div>
  </section>
);

export default TranslationResult;
