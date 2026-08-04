"use client";

import { useMemo } from "react";
import { getAdminGroupPreparation } from "../api/group.api";

export function useAdminGroupQuery(groupId: string) {
  const data = useMemo(() => getAdminGroupPreparation(groupId), [groupId]);

  return {
    data,
    isLoading: false,
    isError: false,
  };
}
