"use client";

import { useMemo } from "react";
import { getParticipantProfileMock } from "../api/participant.mock";

export function useParticipantProfileQuery(participantId: string) {
  const data = useMemo(
    () => getParticipantProfileMock(participantId),
    [participantId],
  );

  return {
    data,
    isLoading: false,
    isError: false,
  };
}