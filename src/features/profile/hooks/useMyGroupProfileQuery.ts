"use client";

import { useEffect, useState } from "react";
import { getMyGroupProfile } from "../api/profile.api";
import type { MyGroupProfile } from "../types/profile.types";

interface UseMyGroupProfileQueryOptions {
  enabled?: boolean;
}

export function useMyGroupProfileQuery(
  groupId: string,
  options: UseMyGroupProfileQueryOptions = {},
) {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<MyGroupProfile | null>(null);
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
        const profile = await getMyGroupProfile(groupId);
        if (!ignore) setData(profile);
      } catch {
        if (!ignore) {
          setIsError(true);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchProfile();

    return () => {
      ignore = true;
    };
  }, [enabled, groupId]);

  return {
    data: enabled ? data : null,
    isLoading: enabled ? isLoading : false,
    isError: enabled ? isError : false,
  };
}
