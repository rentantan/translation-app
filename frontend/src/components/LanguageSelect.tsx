import React from "react";
import { AUTO_DETECT, Language, languageLabel } from "../lib/languages";

type Props = {
  languages: Language[];
  value: string;
  onChange: (val: string) => void;
  label: string;
  /** 「自動検出」を選択肢に含めるか（翻訳元のみ） */
  allowAuto?: boolean;
  /** 自動検出で判定された言語（表示用） */
  detected?: string | null;
};

const LanguageSelect: React.FC<Props> = ({ languages, value, onChange, label, allowAuto, detected }) => (
  <select className="select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
    {allowAuto && (
      <option value={AUTO_DETECT}>
        {value === AUTO_DETECT && detected ? `自動検出（${languageLabel(detected)}）` : "🌐 自動検出"}
      </option>
    )}
    {languages.map((l) => (
      <option key={l.code} value={l.code}>
        {l.flag} {l.label}
      </option>
    ))}
  </select>
);

export default LanguageSelect;
