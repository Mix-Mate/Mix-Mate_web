"use client";

import { useEffect, useState } from "react";
import { getParticipantProfile } from "../api/participant.api";
import type { ParticipantProfile } from "../types/participant.types";

interface UseParticipantProfileQueryOptions {
  detailRole?: "admin";
  enabled?: boolean;
}

export function useParticipantProfileQuery(
  groupId: string,
  participantId: string,
  options: UseParticipantProfileQueryOptions = {},
) {
  const detailRole = options.detailRole;
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<ParticipantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let ignore = false;

    if (!enabled) {
      return () => {
        ignore = true;
      };
    }

    async function fetchProfile() {
      setIsLoading(true);
      setIsError(false);

      try {
        const profile = await getParticipantProfile(groupId, participantId, undefined, {
          detailRole,
        });
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
  }, [detailRole, enabled, groupId, participantId]);

  return {
    data: enabled ? data : null,
    isLoading: enabled ? isLoading : false,
    isError: enabled ? isError : false,
  };
}
