"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminGroupDetail,
  getAdminGroupPreparation,
} from "../api/group.api";

export function useAdminGroupQuery(groupId: string) {
  const [data, setData] = useState(() => getAdminGroupPreparation(groupId));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const group = await getAdminGroupDetail(groupId);
      setData(group);
      return group;
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "그룹 정보를 불러오지 못했습니다.",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    let ignore = false;

    async function fetchGroup() {
      setIsLoading(true);
      setError(null);

      try {
        const group = await getAdminGroupDetail(groupId);
        if (!ignore) setData(group);
      } catch (fetchError) {
        if (!ignore) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "그룹 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchGroup();

    return () => {
      ignore = true;
    };
  }, [groupId]);

  return {
    data,
    isLoading,
    isError: error !== null,
    error,
    refetch,
  };
}
