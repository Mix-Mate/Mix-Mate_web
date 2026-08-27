"use client";

import { useState } from "react";
import { deleteParticipant } from "../api/admin-participant.api";

type DeleteParticipantResult =
  | { ok: true; source: "api" }
  | { ok: false; message: string };

export function useDeleteParticipantMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    groupId: string,
    participantId: string,
  ): Promise<DeleteParticipantResult> => {
    setIsPending(true);

    try {
      return await deleteParticipant(groupId, participantId);
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "참가자 삭제에 실패했습니다.",
      };
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
