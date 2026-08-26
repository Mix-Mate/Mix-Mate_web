"use client";

import { useState } from "react";
import { addParticipant } from "../api/admin-participant.api";
import type { ParticipantProfileRequest } from "../types/participant.types";

type AddParticipantResult =
  | { ok: true; source: "api" | "mock" }
  | { ok: false; message: string };

export function useAddParticipantMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    groupId: string,
    input: ParticipantProfileRequest,
  ): Promise<AddParticipantResult> => {
    setIsPending(true);

    try {
      return await addParticipant(groupId, input);
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "참가자 추가에 실패했습니다.",
      };
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
