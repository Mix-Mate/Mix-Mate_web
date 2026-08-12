"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { confirmAssignment } from "../api/assignment.api";
import type { AssignmentRound } from "../types/assignment.types";

export function useConfirmAssignmentMutation() {
  const confirmAction = useCallback(
    async (groupId: string, round: AssignmentRound) =>
      confirmAssignment(groupId, round),
    [],
  );

  return useAsyncMutation(confirmAction, {
    fallbackErrorMessage: "조 편성 결과를 확정하지 못했습니다.",
    fallbackResult: null,
  });
}
