"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { endGroupVote } from "../api/vote.api";

export function useEndVoteMutation() {
  const endVoteAction = useCallback(async (groupId: string) => {
    await endGroupVote(groupId);
    return true;
  }, []);

  return useAsyncMutation(endVoteAction, {
    fallbackErrorMessage: "투표를 종료하지 못했습니다.",
    fallbackResult: false,
  });
}
