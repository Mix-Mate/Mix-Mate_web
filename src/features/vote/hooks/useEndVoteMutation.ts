"use client";

import { useCallback, useState } from "react";
import { endGroupVote } from "../api/vote.api";

export function useEndVoteMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (groupId: string) => {
    setIsPending(true);
    setError(null);

    try {
      await endGroupVote(groupId);
      return true;
    } catch (endVoteError) {
      setError(
        endVoteError instanceof Error
          ? endVoteError.message
          : "투표를 종료하지 못했습니다.",
      );
      return false;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending, error };
}
