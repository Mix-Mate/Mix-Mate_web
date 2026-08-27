"use client";

import { useEffect, useState } from "react";
import { getMyTeam } from "../api/team.api";
import type { Team, TeamRound } from "../types/team.types";

export function useMyTeamQuery(
  groupId: string,
  round: TeamRound,
  enabled = true,
) {
  const [data, setData] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let ignore = false;

    async function fetchMyTeam() {
      setData(null);
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyTeam(groupId, round);
        if (!ignore) setData(response.team);
      } catch (fetchError) {
        if (!ignore) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "내 조 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchMyTeam();

    return () => {
      ignore = true;
    };
  }, [enabled, groupId, round]);

  return {
    data: enabled ? data : null,
    isLoading: enabled ? isLoading : false,
    error: enabled ? error : null,
    isError: enabled && error !== null,
  };
}
