"use client";

import { useEffect, useState } from "react";
import { getMyGroupProfile } from "../api/profile.api";
import {
  getSavedMyGroupProfile,
  saveMyGroupProfile,
} from "../lib/profile-storage";
import type { MyGroupProfile } from "../types/profile.types";
import { shouldUseMockFallback } from "@/shared/api/apiError";

export function useMyGroupProfileQuery(groupId: string) {
  const [data, setData] = useState<MyGroupProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      setIsLoading(true);
      setIsError(false);

      try {
        const profile = await getMyGroupProfile(groupId);
        saveMyGroupProfile(profile);
        if (!ignore) setData(profile);
      } catch (error) {
        if (!ignore) {
          if (shouldUseMockFallback(error)) {
            setData(getSavedMyGroupProfile());
          }
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
  }, [groupId]);

  return {
    data,
    isLoading,
    isError,
  };
}
