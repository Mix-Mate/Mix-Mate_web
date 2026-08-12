"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { saveFixedMembers } from "../api/assignment.api";
import type {
  AssignmentRound,
  FixedMemberEntry,
} from "../types/assignment.types";

export function useFixedMemberMutation() {
  const saveFixedMembersAction = useCallback(
    async (
      groupId: string,
      round: AssignmentRound,
      fixedMembers: FixedMemberEntry[],
    ) => saveFixedMembers(groupId, round, fixedMembers),
    [],
  );

  return useAsyncMutation(saveFixedMembersAction, {
    fallbackErrorMessage: "고정 멤버를 저장하지 못했습니다.",
    fallbackResult: null,
  });
}
