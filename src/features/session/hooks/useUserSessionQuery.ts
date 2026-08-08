"use client";

import { useMemo } from "react";
import { getMockUserSession } from "../api/session.mock";
import type { GroupRole } from "../types/session.types";

export function useUserSessionQuery(
  scenario?: string,
  role: GroupRole = "USER",
) {
  const data = useMemo(
    () => getMockUserSession(scenario, role),
    [role, scenario],
  );

  return {
    data,
    isLoading: false,
    isError: false,
  };
}
