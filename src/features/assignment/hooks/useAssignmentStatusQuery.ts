"use client";

import { useEffect, useState } from "react";
import { getAssignmentStatus } from "../api/assignment.api";
import type { AssignmentRound } from "../types/assignment.types";

export function useAssignmentStatusQuery(
  groupId: string,
  round: AssignmentRound,
) {
  const [data, setData] = useState(() => getAssignmentStatus(groupId, round));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData(getAssignmentStatus(groupId, round));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [groupId, round]);

  return { data, isComplete: data === "COMPLETED" };
}
