"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { deleteGroup } from "../api/group.api";

export function useDeleteGroupMutation() {
  const deleteGroupAction = useCallback(async (groupId: string) => {
    await deleteGroup(groupId);
    return true;
  }, []);

  return useAsyncMutation(deleteGroupAction, {
    fallbackErrorMessage: "그룹을 삭제하지 못했습니다.",
    fallbackResult: false,
  });
}
