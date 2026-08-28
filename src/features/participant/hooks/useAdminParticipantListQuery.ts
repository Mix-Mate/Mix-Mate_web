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
  options: { enabled?: boolean; polling?: boolean } = {},
) {
  const enabled = options.enabled ?? true;
  const polling = options.polling ?? false;
  const requestIdRef = useRef(0);
  const [data, setData] = useState(initialAdminParticipantGroup);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchParticipants = useCallback(
    async (isInitialRequest: boolean, signal?: AbortSignal) => {
      if (!enabled) {
        return false;
      }

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
    [enabled, groupId, round],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const requestController = new AbortController();
    const initialRequestTimer = window.setTimeout(() => {
      void fetchParticipants(true, requestController.signal);
    }, 0);

    return () => {
      window.clearTimeout(initialRequestTimer);
      requestController.abort();
    };
  }, [enabled, fetchParticipants]);

  useEffect(() => {
    if (!enabled || !polling) {
      return;
    }

    let pollingTimer: number | undefined;
    let pollingController: AbortController | null = null;

    const pollParticipants = async () => {
      pollingController?.abort();
      pollingController = new AbortController();

      const shouldContinue = await fetchParticipants(
        false,
        pollingController.signal,
      );

      if (shouldContinue) {
        pollingTimer = window.setTimeout(
          pollParticipants,
          ADMIN_PARTICIPANT_LIST_POLLING_INTERVAL_MS,
        );
      }
    };

    pollingTimer = window.setTimeout(
      pollParticipants,
      ADMIN_PARTICIPANT_LIST_POLLING_INTERVAL_MS,
    );

    return () => {
      if (pollingTimer !== undefined) {
        window.clearTimeout(pollingTimer);
      }
      pollingController?.abort();
    };
  }, [enabled, fetchParticipants, polling]);

  return {
    data,
    isLoading,
    isError,
  };
}
