"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { confirmTeams } from "../api/assignment.api";
import type { AssignmentRound } from "../types/assignment.types";

export function useConfirmAssignmentMutation() {
  const confirmAssignment = useCallback(
    async (groupId: string, round: AssignmentRound) => {
      await confirmTeams(groupId, round);
      return true;
    },
    [],
  );

  return useAsyncMutation<[string, AssignmentRound], boolean, false>(
    confirmAssignment,
    {
      fallbackErrorMessage: "조 편성 확정에 실패했습니다.",
      fallbackResult: false,
    },
  );
}
