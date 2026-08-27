"use client";

import { useState } from "react";
import { leaveGroup } from "../api/profile.api";

type LeaveGroupResult =
  | { ok: true; source: "api" }
  | { ok: false; message: string };

export function useLeaveGroupMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (groupId: string): Promise<LeaveGroupResult> => {
    setIsPending(true);

    try {
      await leaveGroup(groupId);
      return { ok: true, source: "api" };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : "그룹 탈퇴에 실패했습니다.",
      };
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
  };
}
