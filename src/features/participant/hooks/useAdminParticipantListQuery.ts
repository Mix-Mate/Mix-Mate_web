"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAdminParticipants } from "../api/admin-participant.api";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import type { AdminParticipantGroup } from "../types/participant.types";

const initialAdminParticipantGroup: AdminParticipantGroup = {
  groupName: "",
  participants: [],
};

const ADMIN_PARTICIPANT_LIST_POLLING_INTERVAL_MS = 3000;

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useAdminParticipantListQuery(
  groupId: string,
  round: AssignmentRound,
) {
  const requestIdRef = useRef(0);
  const [data, setData] = useState(initialAdminParticipantGroup);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchParticipants = useCallback(
    async (isInitialRequest: boolean, signal?: AbortSignal) => {
      const requestId = ++requestIdRef.current;

      if (isInitialRequest) {
        setIsLoading(true);
      }
      setIsError(false);

      try {
        const participants = await getAdminParticipants(groupId, round, signal);

        if (requestId === requestIdRef.current) {
          setData(participants);
          setIsError(false);
        }

        return true;
      } catch (error) {
        if (isAbortError(error)) {
          return false;
        }

        if (requestId === requestIdRef.current) {
          setIsError(true);
        }

        return true;
      } finally {
        if (isInitialRequest && requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [groupId, round],
  );

  useEffect(() => {
    const requestController = new AbortController();
    const initialRequestTimer = window.setTimeout(() => {
      void fetchParticipants(true, requestController.signal);
    }, 0);

    return () => {
      window.clearTimeout(initialRequestTimer);
      requestController.abort();
    };
  }, [fetchParticipants]);

  useEffect(() => {
    let active = true;
    let pollingTimer: number | undefined;
    let requestController: AbortController | null = null;

    const poll = async () => {
      requestController = new AbortController();
      const shouldContinuePolling = await fetchParticipants(
        false,
        requestController.signal,
      );
      requestController = null;

      if (active && shouldContinuePolling) {
        pollingTimer = window.setTimeout(() => {
          void poll();
        }, ADMIN_PARTICIPANT_LIST_POLLING_INTERVAL_MS);
      }
    };

    pollingTimer = window.setTimeout(() => {
      void poll();
    }, ADMIN_PARTICIPANT_LIST_POLLING_INTERVAL_MS);

    return () => {
      active = false;
      requestController?.abort();
      if (pollingTimer !== undefined) {
        window.clearTimeout(pollingTimer);
      }
    };
  }, [fetchParticipants]);

  return {
    data,
    isLoading,
    isError,
  };
}
