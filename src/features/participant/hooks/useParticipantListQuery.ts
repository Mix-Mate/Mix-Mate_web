"use client";

import { useMemo } from "react";
import { getParticipantListMock } from "../api/participant.mock";

export function useParticipantListQuery() {
  const data = useMemo(() => getParticipantListMock(), []);

  return {
    data,
    isLoading: false,
    isError: false,
  };
}
