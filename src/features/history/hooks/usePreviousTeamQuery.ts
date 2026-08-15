"use client";

import { useMemo } from "react";
import { getPreviousTeam } from "../api/history.api";

export function usePreviousTeamQuery(groupId: string) {
  const data = useMemo(() => getPreviousTeam(groupId), [groupId]);

  return {
    data,
    isLoading: false,
    isError: false,
  };
}
