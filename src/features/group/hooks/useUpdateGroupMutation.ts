"use client";

import useAsyncMutation from "@/shared/hooks/useAsyncMutation";
import { updateGroup } from "../api/group.api";

export function useUpdateGroupMutation() {
  return useAsyncMutation(updateGroup, {
    fallbackErrorMessage: "그룹 정보를 수정하지 못했습니다.",
    fallbackResult: null,
  });
}
