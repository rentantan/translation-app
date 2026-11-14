import type { HistoryItem, HistoryPage, TranslationResponse, User } from "./types";
import { API_URL } from "./config";

const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** トークン切れなどで 401 が返ったときに発火するイベント */
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** FastAPI のエラーレスポンス（文字列 or バリデーションエラー配列）を読みやすいメッセージにする */
const extractMessage = (detail: unknown, fallback: string): string => {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: unknown[] };
    const field = first.loc?.[first.loc.length - 1];
    const labels: Record<string, string> = { username: "ユーザー名", password: "パスワード", text: "文章" };
    const msg = (first.msg || fallback).replace(/^Value error, /, "");
    if (/at least (\d+) character/.test(msg) && typeof field === "string") {
      return `${labels[field] || field}は${msg.match(/\d+/)![0]}文字以上で入力してください`;
    }
    if (/at most (\d+) character/.test(msg) && typeof field === "string") {
      return `${labels[field] || field}は${msg.match(/\d+/)![0]}文字以内で入力してください`;
    }
    return msg;
  }
  return fallback;
};

async function request<T>(path: string, init: RequestInit = {}, fallback = "通信に失敗しました"): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("サーバーに接続できません。バックエンドが起動しているか確認してください", 0);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && token) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(extractMessage(data.detail, fallback), res.status);
  }
  return res.json();
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  login: (username: string, password: string) =>
    request<{ access_token: string }>(
      "/login",
      { method: "POST", body: new URLSearchParams({ username, password }) },
      "ログインに失敗しました",
    ),

  register: (username: string, password: string) =>
    request<User>("/register", json({ username, password }), "新規登録に失敗しました"),

  me: () => request<User>("/me"),

  translate: (text: string, targetLang: string, sourceLang = "auto") =>
    request<TranslationResponse>(
      "/translate",
      json({ text, target_lang: targetLang, source_lang: sourceLang }),
      "翻訳に失敗しました",
    ),

  history: (params: { skip?: number; limit?: number; q?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.skip) query.set("skip", String(params.skip));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.q) query.set("q", params.q);
    return request<HistoryPage>(`/translations/history?${query}`, {}, "履歴の取得に失敗しました");
  },

  deleteHistory: (id: HistoryItem["id"]) =>
    request(`/translations/history/${id}`, { method: "DELETE" }, "削除に失敗しました"),

  clearHistory: () => request("/translations/history", { method: "DELETE" }, "履歴の削除に失敗しました"),
};
