"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import {
  reissueGroupInvitation,
  type GroupInvitationResponse,
} from "../api/group.api";

export function useReissueGroupInvitationMutation() {
  const reissueInvitation = useCallback(
    async (groupId: string): Promise<GroupInvitationResponse> =>
      reissueGroupInvitation(groupId),
    [],
  );

  return useAsyncMutation(reissueInvitation, {
    fallbackErrorMessage: "참여코드 재발급에 실패했습니다.",
    fallbackResult: null,
  });
}
