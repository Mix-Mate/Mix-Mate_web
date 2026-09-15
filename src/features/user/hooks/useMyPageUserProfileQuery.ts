"use client";

import { useEffect, useState } from "react";
import {
  getMyPageUserProfileApi,
  type MyPageUserProfile,
} from "../api/user.api";

interface UseMyPageUserProfileQueryOptions {
  enabled?: boolean;
}

export function useMyPageUserProfileQuery(
  options: UseMyPageUserProfileQueryOptions = {},
) {
  const enabled = options.enabled ?? true;
  const [data, setData] = useState<MyPageUserProfile | null>(null);
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
        const profile = await getMyPageUserProfileApi();
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
  }, [enabled]);

  return {
    data: enabled ? data : null,
    isLoading: enabled ? isLoading : false,
    isError: enabled ? isError : false,
  };
}
