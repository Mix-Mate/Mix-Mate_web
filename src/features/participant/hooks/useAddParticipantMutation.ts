"use client";

import { useState } from "react";
import { addParticipant } from "../api/admin-participant.api";
import type { ParticipantProfileRequest } from "../types/participant.types";

export function useAddParticipantMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (groupId: string, input: ParticipantProfileRequest) => {
    setIsPending(true);

    try {
      return await addParticipant(groupId, input);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
