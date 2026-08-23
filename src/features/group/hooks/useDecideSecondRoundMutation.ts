"use client";

import { useCallback, useRef } from "react";
import { decideSecondRound } from "../api/group.api";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";

export function useDecideSecondRoundMutation() {
  const requestInFlightRef = useRef(false);
  const decideSecondRoundAction = useCallback(async (groupId: string) => {
    if (requestInFlightRef.current) return false;

    requestInFlightRef.current = true;

    try {
      await decideSecondRound(groupId);
      return true;
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  return useAsyncMutation(decideSecondRoundAction, {
    fallbackErrorMessage: "2차 진행 결정에 실패했습니다.",
    fallbackResult: false,
  });
}
