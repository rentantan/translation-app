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
