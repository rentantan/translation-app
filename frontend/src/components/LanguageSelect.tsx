import React from 'react';

type Props = {
  languages: { code: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
};

const LanguageSelect: React.FC<Props> = ({ languages, value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #ccc', fontSize: '1rem' }}
    >
      <option value="" disabled>
        翻訳する言語を選択
      </option>
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelect;
