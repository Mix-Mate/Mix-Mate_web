"use client";

import { useReducer, useState } from "react";
import {
  getAttendanceVoteContext,
  submitAttendanceVote,
} from "../api/vote.api";
import type { AttendanceChoice } from "../types/vote.types";

export function useAttendanceVote(groupId: string, memberId: string) {
  const [, refresh] = useReducer((version: number) => version + 1, 0);
  const [error, setError] = useState<string | null>(null);
  const context = getAttendanceVoteContext(groupId);

  const submit = (choice: AttendanceChoice) => {
    try {
      submitAttendanceVote({ groupId, memberId, choice });
      setError(null);
      refresh();
      return true;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "투표를 처리하지 못했습니다.",
      );
      return false;
    }
  };

  return { context, error, submit };
}
