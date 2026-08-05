"use client";

import { useMemo } from "react";
import { getAdminRoundTwoPreparation } from "../api/group.api";

export function useAdminRoundTwoPreparationQuery(groupId: string) {
  const data = useMemo(() => getAdminRoundTwoPreparation(groupId), [groupId]);

  return {
    data,
    isLoading: false,
    isError: false,
  };
}
