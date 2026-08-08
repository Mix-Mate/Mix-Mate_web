"use client";

import { useCallback, useState } from "react";
import { endGroupRound } from "../api/session.api";
import type { GroupRound } from "../types/session.types";

export function useEndRoundMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (groupId: string, round: GroupRound) => {
    setIsPending(true);
    setError(null);

    try {
      return await endGroupRound(groupId, round);
    } catch (endRoundError) {
      setError(
        endRoundError instanceof Error
          ? endRoundError.message
          : "술자리를 종료하지 못했습니다.",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending, error };
}
