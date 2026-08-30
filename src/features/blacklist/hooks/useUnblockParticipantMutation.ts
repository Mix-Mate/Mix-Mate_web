"use client";

import { useState } from "react";
import { unblockParticipantApi } from "../api/blacklist.api";

type UnblockParticipantResult =
  | { ok: true; source: "api" | "local" }
  | { ok: false; message: string };

export function useUnblockParticipantMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    groupId: string,
    targetUserId: string | number,
  ): Promise<UnblockParticipantResult> => {
    setIsPending(true);

    try {
      return await unblockParticipantApi(groupId, targetUserId);
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "그룹 차단 해제에 실패했습니다.",
      };
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
