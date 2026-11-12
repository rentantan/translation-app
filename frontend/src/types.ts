export type User = {
  id: number;
  username: string;
  created_at: string;
};

export type TranslationResponse = {
  translated_text: string;
  source_lang: string | null;
};

export type HistoryItem = {
  id: number;
  source_text: string;
  translated_text: string;
  source_lang?: string | null;
  target_lang: string;
  created_at: string;
};

export type HistoryPage = {
  items: HistoryItem[];
  total: number;
};

export type Language = { code: string; label: string; flag: string };

/** バックエンドの SUPPORTED_LANGUAGES と揃えること */
export const LANGUAGES: Language[] = [
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "en", label: "英語", flag: "🇺🇸" },
  { code: "zh-cn", label: "中国語（簡体）", flag: "🇨🇳" },
  { code: "zh-tw", label: "中国語（繁体）", flag: "🇹🇼" },
  { code: "ko", label: "韓国語", flag: "🇰🇷" },
  { code: "fr", label: "フランス語", flag: "🇫🇷" },
  { code: "es", label: "スペイン語", flag: "🇪🇸" },
  { code: "de", label: "ドイツ語", flag: "🇩🇪" },
  { code: "it", label: "イタリア語", flag: "🇮🇹" },
  { code: "pt", label: "ポルトガル語", flag: "🇵🇹" },
  { code: "ru", label: "ロシア語", flag: "🇷🇺" },
];

export const AUTO_DETECT = "auto";

export const MAX_TEXT_LENGTH = 5000;

export const findLanguage = (code?: string | null) =>
  LANGUAGES.find((l) => l.code === code?.toLowerCase());

export const languageLabel = (code?: string | null) => {
  if (!code || code === AUTO_DETECT) return "自動検出";
  const lang = findLanguage(code);
  return lang ? `${lang.flag} ${lang.label}` : `🌐 ${code}`;
};
