"use client";

import { useState } from "react";
import { deleteParticipant } from "../api/admin-participant.api";

export function useDeleteParticipantMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (groupId: string, participantId: string) => {
    setIsPending(true);

    try {
      return await deleteParticipant(groupId, participantId);
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
