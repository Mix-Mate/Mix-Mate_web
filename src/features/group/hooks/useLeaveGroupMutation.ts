"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { leaveGroup } from "../api/group.api";

export function useLeaveGroupMutation() {
  const leaveGroupAction = useCallback(async (groupId: string) => {
    await leaveGroup(groupId);
    return true;
  }, []);

  return useAsyncMutation(leaveGroupAction, {
    fallbackErrorMessage: "그룹 탈퇴에 실패했습니다.",
    fallbackResult: false,
  });
}
