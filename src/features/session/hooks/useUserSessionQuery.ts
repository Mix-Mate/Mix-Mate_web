"use client";

import { useMemo } from "react";
import { getMockUserSession } from "../api/session.mock";

export function useUserSessionQuery(scenario?: string) {
  const data = useMemo(() => getMockUserSession(scenario), [scenario]);

  return {
    data,
    isLoading: false,
    isError: false,
  };
}
