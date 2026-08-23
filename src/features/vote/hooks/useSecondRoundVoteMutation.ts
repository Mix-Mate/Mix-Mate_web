"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { voteSecondRound } from "../api/secondRoundVote.api";
import type { SecondRoundVoteChoice } from "../types/secondRoundVote.types";

export function useSecondRoundVoteMutation() {
  const voteSecondRoundAction = useCallback(
    async (groupId: string, choice: SecondRoundVoteChoice) => {
      await voteSecondRound(groupId, choice);
      return true;
    },
    [],
  );

  return useAsyncMutation<
    [string, SecondRoundVoteChoice],
    boolean,
    false
  >(voteSecondRoundAction, {
    fallbackErrorMessage: "2차 참여 여부 투표에 실패했습니다.",
    fallbackResult: false,
  });
}
