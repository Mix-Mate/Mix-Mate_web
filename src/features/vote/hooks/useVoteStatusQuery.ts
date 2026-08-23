"use client";

import { useEffect, useState } from "react";
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

function createInitialQueryState(groupId: string): VoteStatusQueryState {
  return {
    groupId,
    data: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
  };
}

export function useVoteStatusQuery(groupId: string) {
  const [queryState, setQueryState] = useState<VoteStatusQueryState>(() =>
    createInitialQueryState(groupId),
  );
  const currentState =
    queryState.groupId === groupId
      ? queryState
      : createInitialQueryState(groupId);

  useEffect(() => {
    let active = true;
    let pollingTimer: number | undefined;
    let requestController: AbortController | null = null;

    const scheduleNextPoll = () => {
      pollingTimer = window.setTimeout(() => {
        void fetchStatus(false);
      }, POLLING_INTERVAL_MS);
    };

    const fetchStatus = async (isInitialRequest: boolean) => {
      requestController = new AbortController();
      if (!isInitialRequest) {
        setQueryState((previousState) =>
          previousState.groupId === groupId
            ? { ...previousState, isRefreshing: true }
            : previousState,
        );
      }
      let shouldContinuePolling = true;

      try {
        const nextData = await getSecondRoundVoteStatus(
          groupId,
          requestController.signal,
        );

        if (active) {
          setQueryState({
            groupId,
            data: nextData,
            isLoading: false,
            isRefreshing: false,
            error: null,
          });
        }
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === "AbortError"
        ) {
          shouldContinuePolling = false;
        } else if (active) {
          const errorMessage =
            fetchError instanceof Error
              ? fetchError.message
              : "투표 현황을 불러오지 못했습니다.";

          setQueryState((previousState) => ({
            groupId,
            data:
              previousState.groupId === groupId ? previousState.data : null,
            isLoading: false,
            isRefreshing: false,
            error: errorMessage,
          }));

          if (
            fetchError instanceof VoteApiError &&
            [401, 403, 404].includes(fetchError.status)
          ) {
            shouldContinuePolling = false;
          }
        }
      } finally {
        requestController = null;

        if (active) {
          if (shouldContinuePolling) scheduleNextPoll();
        }
      }
    };

    void fetchStatus(true);

    return () => {
      active = false;
      requestController?.abort();
      if (pollingTimer !== undefined) window.clearTimeout(pollingTimer);
    };
  }, [groupId]);

  const isComplete =
    currentState.data !== null &&
    currentState.data.totalParticipantCount > 0 &&
    currentState.data.votedCount >= currentState.data.totalParticipantCount;

  return {
    ...currentState,
    isComplete,
  };
}
