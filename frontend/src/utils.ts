import { useCallback, useEffect, useRef, useState } from "react";

/** 一定時間で消えるトースト通知 */
export const useToast = (duration = 2000) => {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(
    (msg: string) => {
      setMessage(msg);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(""), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);
  return { message, show };
};

/** 値の変化を一定時間待ってから反映する */
export const useDebounce = <T,>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

/** localStorage に保存される state */
export const usePersistentState = (key: string, initial: string) => {
  const [value, setValue] = useState(() => localStorage.getItem(key) ?? initial);
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue] as const;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** 「3分前」のような相対時刻。1週間以上前は日時を表示する */
export const formatRelativeTime = (dateString: string, now = new Date()): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}時間前`;
  if (minutes < 7 * 24 * 60) return `${Math.floor(minutes / (24 * 60))}日前`;
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
