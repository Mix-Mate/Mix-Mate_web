"use client";

import { useReducer, useState } from "react";
import { getMvpVoteContext, submitMvpVote } from "../api/vote.api";

export function useMvpVote(groupId: string) {
  const [, refresh] = useReducer((version: number) => version + 1, 0);
  const [error, setError] = useState<string | null>(null);
  const context = getMvpVoteContext(groupId);

  const submit = (candidateId: string) => {
    try {
      submitMvpVote({
        groupId,
        voterId: context.currentMemberId,
        candidateId,
      });
      setError(null);
      refresh();
      return true;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "투표를 처리하지 못했습니다.",
      );
      return false;
    }
  };

  return { context, error, submit };
}
