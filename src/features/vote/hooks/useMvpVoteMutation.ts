"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { voteMvp } from "../api/mvpVote.api";

export function useMvpVoteMutation() {
  const voteMvpAction = useCallback(
    async (groupId: string, targetParticipantId: number) => {
      await voteMvp(groupId, targetParticipantId);
      return true;
    },
    [],
  );

  return useAsyncMutation<[string, number], boolean, false>(voteMvpAction, {
    fallbackErrorMessage: "MVP 투표에 실패했습니다.",
    fallbackResult: false,
  });
}
