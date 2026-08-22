"use client";

import { useCallback } from "react";
import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { closeRecruiting } from "../api/group.api";

export function useCloseRecruitingMutation() {
  const closeRecruitingAction = useCallback(async (groupId: string) => {
    await closeRecruiting(groupId);
    return true;
  }, []);

  return useAsyncMutation(closeRecruitingAction, {
    fallbackErrorMessage: "참가자 모집 마감에 실패했습니다.",
    fallbackResult: false,
  });
}
