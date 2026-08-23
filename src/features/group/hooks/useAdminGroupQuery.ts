"use client";

import { createContext, useContext } from "react";
import type { GroupDetail } from "../types/group.types";

export interface AdminGroupQueryResult {
  groupId: string;
  data: GroupDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<GroupDetail | null>;
}

export const AdminGroupQueryContext =
  createContext<AdminGroupQueryResult | null>(null);

export function useAdminGroupQuery(groupId: string) {
  const query = useContext(AdminGroupQueryContext);

  if (!query || query.groupId !== groupId) {
    throw new Error(
      "useAdminGroupQuery는 AdminGroupQueryProvider 안에서 사용해야 합니다.",
    );
  }

  return query;
}
