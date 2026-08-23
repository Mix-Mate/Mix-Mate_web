"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSecondRoundVoteStatus } from "../api/secondRoundVoteStatus.api";
import { VoteApiError } from "../api/voteApiError";
import type { SecondRoundVoteStatusResponse } from "../types/secondRoundVoteStatus.types";

const POLLING_INTERVAL_MS = 3000;

interface VoteStatusQueryState {
  groupId: string;
  data: SecondRoundVoteStatusResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface UseVoteStatusQueryOptions {
  pollingEnabled?: boolean;
}

interface FetchVoteStatusResult {
  data: SecondRoundVoteStatusResponse | null;
  shouldContinuePolling: boolean;
}

function createInitialQueryState(groupId: string): VoteStatusQueryState {
  return {
    groupId,
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
  };
}

export function useVoteStatusQuery(
  groupId: string,
  { pollingEnabled = true }: UseVoteStatusQueryOptions = {},
) {
  const requestIdRef = useRef(0);
  const [queryState, setQueryState] = useState<VoteStatusQueryState>(() =>
    createInitialQueryState(groupId),
  );
  const currentState =
    queryState.groupId === groupId
      ? queryState
      : createInitialQueryState(groupId);

  const fetchStatus = useCallback(
    async (
      isInitialRequest: boolean,
      signal?: AbortSignal,
    ): Promise<FetchVoteStatusResult> => {
      const requestId = ++requestIdRef.current;

      setQueryState((previousState) => {
        if (isInitialRequest || previousState.groupId !== groupId) {
          return createInitialQueryState(groupId);
        }

        return { ...previousState, isRefreshing: true };
      });

      try {
        const nextData = await getSecondRoundVoteStatus(groupId, signal);

        if (requestId === requestIdRef.current) {
          setQueryState({
            groupId,
            data: nextData,
            isLoading: false,
            isRefreshing: false,
            error: null,
          });
        }

        return { data: nextData, shouldContinuePolling: true };
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          return { data: null, shouldContinuePolling: false };
        }

        const errorMessage =
          fetchError instanceof Error
            ? fetchError.message
            : "투표 현황을 불러오지 못했습니다.";

        if (requestId === requestIdRef.current) {
          setQueryState((previousState) => ({
            groupId,
            data:
              previousState.groupId === groupId ? previousState.data : null,
            isLoading: false,
            isRefreshing: false,
            error: errorMessage,
          }));
        }

        const shouldContinuePolling = !(
          fetchError instanceof VoteApiError &&
          [401, 403, 404].includes(fetchError.status)
        );

        return { data: null, shouldContinuePolling };
      }
    },
    [groupId],
  );

  useEffect(() => {
    const requestController = new AbortController();
    const initialRequestTimer = window.setTimeout(() => {
      void fetchStatus(true, requestController.signal);
    }, 0);

    return () => {
      window.clearTimeout(initialRequestTimer);
      requestController.abort();
    };
  }, [fetchStatus]);

  useEffect(() => {
    if (!pollingEnabled) return;

    let active = true;
    let pollingTimer: number | undefined;
    let requestController: AbortController | null = null;

    const poll = async () => {
      requestController = new AbortController();
      const result = await fetchStatus(false, requestController.signal);
      requestController = null;

      if (active && result.shouldContinuePolling) {
        pollingTimer = window.setTimeout(() => {
          void poll();
        }, POLLING_INTERVAL_MS);
      }
    };

    pollingTimer = window.setTimeout(() => {
      void poll();
    }, POLLING_INTERVAL_MS);

    return () => {
      active = false;
      requestController?.abort();
      if (pollingTimer !== undefined) window.clearTimeout(pollingTimer);
    };
  }, [fetchStatus, pollingEnabled]);

  const refetch = useCallback(async () => {
    const result = await fetchStatus(false);
    return result.data;
  }, [fetchStatus]);

  const isComplete =
    currentState.data !== null &&
    currentState.data.totalParticipantCount > 0 &&
    currentState.data.votedCount >= currentState.data.totalParticipantCount;

  return {
    ...currentState,
    isComplete,
    refetch,
  };
}
