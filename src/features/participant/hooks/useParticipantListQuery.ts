"use client";

import { useEffect, useState } from "react";
import { getParticipants } from "../api/participant.api";
import type { ParticipantGroup } from "../types/participant.types";

const initialParticipantGroup: ParticipantGroup = {
  groupName: "",
  participants: [],
  teams: [],
};

const PARTICIPANT_LIST_POLLING_INTERVAL_MS = 3000;

export function useParticipantListQuery(groupId: string) {
  const [data, setData] = useState(initialParticipantGroup);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let ignore = false;
    let isFetching = false;

    async function fetchParticipants(showLoading = false) {
      if (isFetching) return;

      isFetching = true;
      if (showLoading) setIsLoading(true);
      setIsError(false);

      try {
        const participants = await getParticipants(groupId);
        if (!ignore) setData(participants);
      } catch {
        if (!ignore) setIsError(true);
      } finally {
        isFetching = false;
        if (!ignore && showLoading) setIsLoading(false);
      }
    }

    void fetchParticipants(true);
    const intervalId = window.setInterval(() => {
      void fetchParticipants();
    }, PARTICIPANT_LIST_POLLING_INTERVAL_MS);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [groupId]);

  return {
    data,
    isLoading,
    isError,
  };
}
