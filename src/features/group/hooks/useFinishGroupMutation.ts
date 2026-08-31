"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { finishGroup } from "../api/group.api";

export function useFinishGroupMutation() {
  const finishGroupAction = useCallback(async (groupId: string) => {
    await finishGroup(groupId);
    return true;
  }, []);

  return useAsyncMutation(finishGroupAction, {
    fallbackErrorMessage: "모임 종료에 실패했습니다.",
    fallbackResult: false,
  });
}
