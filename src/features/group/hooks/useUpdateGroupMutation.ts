"use client";

import { useCallback, useState } from "react";
import { GroupApiError, updateGroup } from "../api/group.api";
import type { UpdateGroupRequest } from "../types/group.types";

export function useUpdateGroupMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutate = useCallback(
    async (groupId: string, request: UpdateGroupRequest) => {
      setIsPending(true);
      setError(null);
      setFieldErrors({});
      try {
        await updateGroup(groupId, request);
        return true;
      } catch (mutationError) {
        setError(
          mutationError instanceof Error
            ? mutationError.message
            : "그룹 정보 수정에 실패했습니다.",
        );
        if (mutationError instanceof GroupApiError) {
          setFieldErrors(mutationError.fieldErrors ?? {});
        }
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { mutate, isPending, error, fieldErrors };
}
