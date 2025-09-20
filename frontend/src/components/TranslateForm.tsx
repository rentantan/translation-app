import React, { useState } from "react";

const TranslateForm: React.FC = () => {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("ja");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleTranslate = async () => {
    setError("");
    setResult("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("ログインが必要です");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error("翻訳リクエストに失敗しました");
      }

      const data = await response.json();
      setResult(data.translated_text);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="translate-form">
      <h2>翻訳アプリ</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="翻訳したいテキストを入力"
      />
      <div>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          <option value="ja">日本語</option>
          <option value="en">英語</option>
          <option value="fr">フランス語</option>
          <option value="de">ドイツ語</option>
          <option value="zh-cn">中国語（簡体）</option>
        </select>
        <button onClick={handleTranslate}>翻訳</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <div className="result">
          <h3>翻訳結果</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default TranslateForm;
