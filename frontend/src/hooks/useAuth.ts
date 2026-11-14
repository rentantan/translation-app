import { useCallback, useEffect, useState } from "react";
import { api, clearToken, getToken, setToken, UNAUTHORIZED_EVENT } from "../api";
import type { User } from "../types";

/** ログイン状態（トークン・ユーザー情報・期限切れ時のメッセージ）を管理する */
export const useAuth = () => {
  const [token, setTokenState] = useState<string | null>(getToken);
  const [user, setUser] = useState<User | null>(null);
  const [sessionMessage, setSessionMessage] = useState("");

  const login = useCallback((accessToken: string) => {
    setToken(accessToken);
    setTokenState(accessToken);
    setSessionMessage("");
  }, []);

  const logout = useCallback((message = "") => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setSessionMessage(message);
  }, []);

  // トークンが有効か確認してユーザー情報を取得
  useEffect(() => {
    if (!token) return;
    api.me().then(setUser).catch(() => {
      /* 401 は UNAUTHORIZED_EVENT 経由で処理される */
    });
  }, [token]);

  // API が 401 を返したら（トークン期限切れなど）ログアウト
  useEffect(() => {
    const onUnauthorized = () => logout("ログインの有効期限が切れました。再度ログインしてください。");
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  return { isLoggedIn: Boolean(token), user, sessionMessage, login, logout };
};
