"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { generateTeams } from "../api/assignment.api";
import type {
  AssignmentRound,
  TeamGenerateRequestBody,
  TeamGenerateResponse,
} from "../types/assignment.types";

export function useCreateAssignmentMutation() {
  const createAssignment = useCallback(
    (
      groupId: string,
      round: AssignmentRound,
      body: TeamGenerateRequestBody,
    ) => generateTeams(groupId, round, body),
    [],
  );

  return useAsyncMutation<
    [string, AssignmentRound, TeamGenerateRequestBody],
    TeamGenerateResponse,
    null
  >(createAssignment, {
    fallbackErrorMessage: "조 편성 실행에 실패했습니다.",
    fallbackResult: null,
  });
}
