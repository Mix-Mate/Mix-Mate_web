"use client";

import { useEffect, useState } from "react";
import { getAdminParticipants } from "../api/admin-participant.api";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import type { AdminParticipantGroup } from "../types/participant.types";

const initialAdminParticipantGroup: AdminParticipantGroup = {
  groupName: "",
  participants: [],
};

const ADMIN_PARTICIPANT_LIST_POLLING_INTERVAL_MS = 3000;

export function useAdminParticipantListQuery(
  groupId: string,
  round: AssignmentRound,
) {
  const [data, setData] = useState(initialAdminParticipantGroup);
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
        const participants = await getAdminParticipants(groupId, round);
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
    }, ADMIN_PARTICIPANT_LIST_POLLING_INTERVAL_MS);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, [groupId, round]);

  return {
    data,
    isLoading,
    isError,
  };
}
