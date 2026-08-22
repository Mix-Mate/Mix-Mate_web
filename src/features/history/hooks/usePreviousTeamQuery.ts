"use client";

import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";

export function usePreviousTeamQuery(groupId: string) {
  return useMyTeamQuery(groupId, "FIRST_ROUND");
}
