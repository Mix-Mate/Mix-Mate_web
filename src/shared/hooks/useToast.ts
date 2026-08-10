"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TOAST_DURATION_MS = 2200;

export default function useToast(durationMs = DEFAULT_TOAST_DURATION_MS) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setMessage(null);
  }, []);

  const showToast = useCallback(
    (nextMessage: string) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      setMessage(nextMessage);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setMessage(null);
      }, durationMs);
    },
    [durationMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  return { message, showToast, hideToast };
}
