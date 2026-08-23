"use client";

import { useEffect, useState } from "react";
import { getAdminParticipants } from "../api/admin-participant.api";
import { adminParticipantGroupMock } from "../api/admin-participant.mock";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";

export function useAdminParticipantListQuery(
  groupId: string,
  round: AssignmentRound,
) {
  const [data, setData] = useState(adminParticipantGroupMock);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchParticipants() {
      setIsLoading(true);
      setIsError(false);

      try {
        const participants = await getAdminParticipants(groupId, round);
        if (!ignore) setData(participants);
      } catch {
        if (!ignore) setIsError(true);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchParticipants();

    return () => {
      ignore = true;
    };
  }, [groupId, round]);

  return {
    data,
    isLoading,
    isError,
  };
}
