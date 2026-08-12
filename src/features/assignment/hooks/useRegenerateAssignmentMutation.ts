"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { regenerateAssignment } from "../api/assignment.api";
import type { AssignmentRound } from "../types/assignment.types";

export function useRegenerateAssignmentMutation() {
  const regenerateAction = useCallback(
    async (groupId: string, round: AssignmentRound) =>
      regenerateAssignment(groupId, round),
    [],
  );

  return useAsyncMutation(regenerateAction, {
    fallbackErrorMessage: "재셔플에 실패했습니다.",
    fallbackResult: null,
  });
}
