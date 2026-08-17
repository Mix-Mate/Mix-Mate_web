"use client";

import { useEffect, useState } from "react";
import { getParticipantProfile } from "../api/participant.api";
import { getParticipantProfileMock } from "../api/participant.mock";

export function useParticipantProfileQuery(groupId: string, participantId: string) {
  const [data, setData] = useState(() => getParticipantProfileMock(participantId));
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      setIsLoading(true);
      setIsError(false);

      try {
        const profile = await getParticipantProfile(groupId, participantId);
        if (!ignore) setData(profile);
      } catch {
        if (!ignore) setIsError(true);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchProfile();

    return () => {
      ignore = true;
    };
  }, [groupId, participantId]);

  return {
    data,
    isLoading,
    isError,
  };
}
