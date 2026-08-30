"use client";

import { useState } from "react";
import { blockParticipantApi } from "../api/blacklist.api";
import type { ParticipantProfile } from "@/features/participant/types/participant.types";
import type { BlockParticipantRequest } from "../types/blacklist.types";

type BlockParticipantResult =
  | { ok: true; source: "api" | "local" }
  | { ok: false; message: string };

export function useBlockParticipantMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    groupId: string,
    participant: ParticipantProfile,
    input: BlockParticipantRequest,
  ): Promise<BlockParticipantResult> => {
    setIsPending(true);

    try {
      return await blockParticipantApi(groupId, participant, input);
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "참가자 차단에 실패했습니다.",
      };
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
