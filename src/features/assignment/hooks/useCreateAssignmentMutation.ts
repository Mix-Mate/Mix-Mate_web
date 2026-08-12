"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { createAssignment } from "../api/assignment.api";
import type { AssignmentRound } from "../types/assignment.types";

export function useCreateAssignmentMutation() {
  const createAssignmentAction = useCallback(
    async (groupId: string, round: AssignmentRound) =>
      createAssignment(groupId, round),
    [],
  );

  return useAsyncMutation(createAssignmentAction, {
    fallbackErrorMessage: "조 편성을 시작하지 못했습니다.",
    fallbackResult: null,
  });
}
