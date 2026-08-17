"use client";

import { useEffect, useState } from "react";
import { getParticipants } from "../api/assignment.api";
import type {
  AssignmentRound,
  ParticipantCandidate,
} from "../types/assignment.types";

export function useParticipantCandidatesQuery(
  groupId: string,
  round: AssignmentRound,
) {
  const [data, setData] = useState<ParticipantCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchCandidates() {
      setIsLoading(true);
      setError(null);

      try {
        const participants = await getParticipants(groupId, round);
        if (!ignore) setData(participants);
      } catch (fetchError) {
        if (!ignore) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "참가자 목록을 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchCandidates();

    return () => {
      ignore = true;
    };
  }, [groupId, round]);

  return { data, isLoading, error };
}
