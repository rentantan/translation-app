import React, { useState } from 'react';
import { LANGUAGES, TranslationResponse } from './types';
import TextInput from './components/TextInput';
import LanguageSelect from './components/LanguageSelect';
import TranslateButton from './components/TranslateButton';
import TranslationResult from './components/TranslationResult';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [targetLang, setTargetLang] = useState(''); // 初期値は空文字（プレースホルダー用）
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('翻訳する文章を入力してください');
      return;
    }
    if (!targetLang) {
      setError('翻訳する言語を選択してください');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_lang: targetLang }),
      });
      const data: TranslationResponse = await response.json();
      setTranslated(data.translated_text);
    } catch (err) {
      console.error(err);
      setTranslated('翻訳に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #6a11cb, #2575fc)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        fontFamily: '"Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            color: '#333',
            marginBottom: '1.5rem',
            fontSize: '2rem',
          }}
        >
          翻訳アプリ
        </h1>

        <TextInput value={text} onChange={setText} onEnter={handleTranslate} />
        {error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <LanguageSelect languages={LANGUAGES} value={targetLang} onChange={setTargetLang} />
        </div>

        <TranslateButton onClick={handleTranslate} loading={loading} disabled={loading || !targetLang} />

        <TranslationResult text={translated} />
      </div>
    </div>
  );
};

export default App;
