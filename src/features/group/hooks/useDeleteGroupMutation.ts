"use client";

import { useState } from "react";
import { deleteGroup } from "../api/group.api";

export function useDeleteGroupMutation() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (groupId: string) => {
    setIsPending(true);
    setError(null);

    try {
      await deleteGroup(groupId);
      return true;
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "그룹을 삭제하지 못했습니다.",
      );
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}
