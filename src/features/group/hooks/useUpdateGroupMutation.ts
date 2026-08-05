"use client";

import { useCallback, useState } from "react";
import { updateGroup } from "../api/group.api";
import type { UpdateGroupInput } from "../types/group.types";

export function useUpdateGroupMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (groupId: string, input: UpdateGroupInput) => {
      setIsPending(true);
      setError(null);

      try {
        return await updateGroup(groupId, input);
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "그룹 정보를 수정하지 못했습니다.",
        );
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  return { mutate, isPending, error };
}
