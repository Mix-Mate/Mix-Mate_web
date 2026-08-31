"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getHistoryPosition } from "@/shared/lib/navigation/history-position";

export function useVoteNavigation(backHref: string) {
  const router = useRouter();
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  const replace = useCallback(
    (href: string) => {
      if (!activeRef.current) return;
      activeRef.current = false;
      router.replace(href);
    },
    [router],
  );
  const back = useCallback(() => replace(backHref), [backHref, replace]);

  useEffect(() => {
    const entryIndex = getHistoryPosition();
    const onPopState = (event: PopStateEvent) => {
      const nextIndex = getHistoryPosition(event.state);
      // 방향을 판별할 수 없으면 브라우저 기본 동작을 유지한다.
      if (
        entryIndex === undefined ||
        nextIndex === undefined ||
        entryIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= entryIndex
      )
        return;
      if (!activeRef.current) return;
      // Next가 이전 화면을 복원하기 전에 목적지를 교체한다.
      // 가짜 히스토리 추가나 history.forward()로 뒤로가기를 막지 않는다.
      event.stopImmediatePropagation();
      back();
    };

    window.addEventListener("popstate", onPopState, true);
    return () => window.removeEventListener("popstate", onPopState, true);
  }, [back]);

  return { back, replace };
}
