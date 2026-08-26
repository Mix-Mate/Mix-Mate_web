"use client";

import { useState } from "react";
import { leaveGroup } from "../api/profile.api";
import { shouldUseMockFallback } from "@/shared/api/apiError";

type LeaveGroupResult =
  | { ok: true; source: "api" }
  | { ok: true; source: "mock" }
  | { ok: false; message: string };

export function useLeaveGroupMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (groupId: string): Promise<LeaveGroupResult> => {
    setIsPending(true);

    try {
      await leaveGroup(groupId);
      return { ok: true, source: "api" };
    } catch (error) {
      if (shouldUseMockFallback(error)) {
        return { ok: true, source: "mock" };
      }

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
