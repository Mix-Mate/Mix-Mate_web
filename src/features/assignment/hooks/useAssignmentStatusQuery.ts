"use client";

import { useEffect, useState } from "react";
import { getAssignmentStatus } from "../api/assignment.api";
import type { AssignmentProgressStatus } from "../types/assignment.types";

const POLL_INTERVAL_MS = 400;

const INITIAL_STATUS: AssignmentProgressStatus = {
  progress: 0,
  isComplete: false,
};

export function useAssignmentStatusQuery() {
  const [status, setStatus] =
    useState<AssignmentProgressStatus>(INITIAL_STATUS);

  useEffect(() => {
    const startedAt = Date.now();

    const pollTimer = window.setInterval(() => {
      const next = getAssignmentStatus(startedAt);
      setStatus(next);
      if (next.isComplete) {
        window.clearInterval(pollTimer);
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(pollTimer);
  }, []);

  return status;
}
