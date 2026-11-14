export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** 1 回に翻訳できる最大文字数（バックエンドの MAX_TEXT_LENGTH と揃えること） */
export const MAX_TEXT_LENGTH = 5000;
