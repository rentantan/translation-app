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
