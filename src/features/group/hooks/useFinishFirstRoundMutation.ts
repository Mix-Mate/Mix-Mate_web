"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { finishFirstRound } from "../api/group.api";

export function useFinishFirstRoundMutation() {
  const finishFirstRoundAction = useCallback(async (groupId: string) => {
    await finishFirstRound(groupId);
    return true;
  }, []);

  return useAsyncMutation(finishFirstRoundAction, {
    fallbackErrorMessage: "1차 종료에 실패했습니다.",
    fallbackResult: false,
  });
}
