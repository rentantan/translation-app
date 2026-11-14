import React from "react";
import { MAX_TEXT_LENGTH } from "../config";

type Props = {
  value: string;
  onChange: (val: string) => void;
  onEnter: () => void;
  onClear?: () => void;
};

const TextInput: React.FC<Props> = ({ value, onChange, onEnter, onClear }) => {
  const over = value.length > MAX_TEXT_LENGTH;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 日本語入力の変換確定の Enter では翻訳しない（Safari は keyCode 229 を返す）
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="pane">
      <div className="pane__body">
        <textarea
          className="textarea pane__textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="翻訳したい文章を入力"
          aria-label="翻訳する文章"
          autoFocus
        />
        {value && onClear && (
          <button type="button" className="icon-btn pane__clear" onClick={onClear} aria-label="入力をクリア" title="クリア">
            ✕
          </button>
        )}
      </div>
      <div className={`input-meta${over ? " input-meta--over" : ""}`}>
        <span className="input-meta__hint">Enter で翻訳 / Shift + Enter で改行</span>
        <span>
          {value.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} 文字
        </span>
      </div>
    </div>
  );
};

export default TextInput;
