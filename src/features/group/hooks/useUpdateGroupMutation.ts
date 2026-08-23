"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { updateGroup } from "../api/group.api";
import type { UpdateGroupRequest } from "../types/group.types";

export function useUpdateGroupMutation() {
  const updateGroupAction = useCallback(
    async (groupId: string, request: UpdateGroupRequest) => {
      await updateGroup(groupId, request);
      return true;
    },
    [],
  );

  return useAsyncMutation(updateGroupAction, {
    fallbackErrorMessage: "그룹 정보 수정에 실패했습니다.",
    fallbackResult: false,
  });
}
