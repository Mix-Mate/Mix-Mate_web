"use client";

import { useCallback, useRef } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { finishVote } from "../api/finishVote.api";

export function useFinishVoteMutation() {
  const requestInFlightRef = useRef(false);
  const finishVoteAction = useCallback(async (groupId: string) => {
    if (requestInFlightRef.current) return false;

    requestInFlightRef.current = true;

    try {
      await finishVote(groupId);
      return true;
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  return useAsyncMutation(finishVoteAction, {
    fallbackErrorMessage: "투표 종료에 실패했습니다.",
    fallbackResult: false,
  });
}
