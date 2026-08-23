"use client";

import { useEffect, useState } from "react";
import { getVoteResult } from "../api/voteResult.api";
import type { VoteResultResponse } from "../types/voteResult.types";

export function useVoteResultQuery(groupId: string) {
  const [data, setData] = useState<VoteResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchVoteResult() {
      setData(null);
      setIsLoading(true);
      setError(null);

      try {
        const result = await getVoteResult(groupId);
        if (!ignore) setData(result);
      } catch (fetchError) {
        if (!ignore) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "투표 결과를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchVoteResult();

    return () => {
      ignore = true;
    };
  }, [groupId]);

  return {
    data,
    isLoading,
    error,
    isError: error !== null,
  };
}
