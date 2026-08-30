"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGroupBlacklist } from "../api/blacklist.api";
import type { BlockedParticipantGroup } from "../types/blacklist.types";

const initialBlockedGroup: BlockedParticipantGroup = {
  groupName: "",
  participants: [],
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useGroupBlacklistQuery(
  groupId: string,
  options: { enabled?: boolean } = {},
) {
  const enabled = options.enabled ?? true;
  const requestIdRef = useRef(0);
  const [data, setData] = useState<BlockedParticipantGroup>(initialBlockedGroup);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const refetch = useCallback(
    async (isInitialRequest = false, signal?: AbortSignal) => {
      if (!enabled || !groupId) return false;

      const requestId = ++requestIdRef.current;
      if (isInitialRequest) {
        setIsLoading(true);
      }
      setIsError(false);

      try {
        const blacklist = await getGroupBlacklist(groupId, signal);
        if (requestId === requestIdRef.current) {
          setData(blacklist);
          setIsError(false);
        }
        return true;
      } catch (error) {
        if (isAbortError(error)) return false;
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
    [enabled, groupId],
  );

  useEffect(() => {
    if (!enabled || !groupId) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void refetch(true, controller.signal);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, groupId, refetch]);

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}
