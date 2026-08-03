"use client";

import { useMemo } from "react";
import { getMyTeam } from "../api/team.api";

export function useMyTeamQuery(groupId: string) {
  const data = useMemo(() => getMyTeam(groupId), [groupId]);

  return {
    data,
    isLoading: false,
    isError: false,
  };
}
