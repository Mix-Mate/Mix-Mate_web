"use client";

import { useEffect, useState } from "react";
import { getVoteResult } from "../api/voteResult.api";
import type { VoteResultResponse } from "../types/voteResult.types";
import { VoteApiError } from "../api/voteApiError";

const RETRY_INTERVAL_MS = 1500;
const MAX_RETRY_COUNT = 10;

/**
 * 마지막 참가자가 투표하면 프론트는 곧바로 결과 화면으로 넘어가지만,
 * 서버가 그룹 상태를 VOTE_CLOSED로 반영하기까지 짧은 지연이 있을 수 있다.
 * 그 사이 조회하면 INVALID_GROUP_STATUS(409)가 나므로, 이 경우에만 잠깐 재시도한다.
 */
function isVoteNotClosedYetError(error: unknown): boolean {
  return (
    error instanceof VoteApiError &&
    error.status === 409 &&
    error.code === "INVALID_GROUP_STATUS"
  );
}

export function useVoteResultQuery(groupId: string) {
  const [data, setData] = useState<VoteResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    let retryTimer: number | undefined;

    async function fetchVoteResult(retryCount: number) {
      if (retryCount === 0) {
        setData(null);
        setIsLoading(true);
        setError(null);
      }

      try {
        const result = await getVoteResult(groupId);
        if (!ignore) {
          setData(result);
          setIsLoading(false);
        }
      } catch (fetchError) {
        if (ignore) return;

        if (isVoteNotClosedYetError(fetchError) && retryCount < MAX_RETRY_COUNT) {
          retryTimer = window.setTimeout(() => {
            void fetchVoteResult(retryCount + 1);
          }, RETRY_INTERVAL_MS);
          return;
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "투표 결과를 불러오지 못했습니다.",
        );
        setIsLoading(false);
      }
    }

    void fetchVoteResult(0);

    return () => {
      ignore = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [groupId]);

  return {
    data,
    isLoading,
    error,
    isError: error !== null,
  };
}
