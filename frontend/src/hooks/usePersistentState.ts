import { useEffect, useState } from "react";

/** localStorage に保存される state */
export const usePersistentState = (key: string, initial: string) => {
  const [value, setValue] = useState(() => localStorage.getItem(key) ?? initial);
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue] as const;
};
