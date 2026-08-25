"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGroupDetail } from "@/features/group/api/group.api";
import type {
  AttendanceVoteContext,
  SecondRoundVoteChoice,
} from "../types/secondRoundVote.types";
import type { VoteStatus } from "../types/vote.types";
import { useSecondRoundVoteMutation } from "./useSecondRoundVoteMutation";

export function useAttendanceVote(groupId: string) {
  const {
    mutate: submitSecondRoundVote,
    isPending: isSubmitting,
    error: submissionError,
  } = useSecondRoundVoteMutation();
  const [status, setStatus] = useState<VoteStatus>("OPEN");
  const [isLoading, setIsLoading] = useState(true);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const submissionInFlightRef = useRef(false);

  useEffect(() => {
    let ignore = false;

    async function fetchVoteStatus() {
      setStatus("OPEN");
      setIsLoading(true);
      setGroupError(null);
      setHasSubmitted(false);

      try {
        const group = await getGroupDetail(groupId);
        if (!ignore) setStatus(group.status === "VOTING" ? "OPEN" : "CLOSED");
      } catch (fetchError) {
        if (!ignore) {
          setGroupError(
            fetchError instanceof Error
              ? fetchError.message
              : "투표 상태를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void fetchVoteStatus();

    return () => {
      ignore = true;
    };
  }, [groupId]);

  const submit = useCallback(
    async (choice: SecondRoundVoteChoice) => {
      if (hasSubmitted || isSubmitting || submissionInFlightRef.current) {
        return false;
      }

      submissionInFlightRef.current = true;

      try {
        const didSubmit = await submitSecondRoundVote(groupId, choice);

        if (didSubmit) setHasSubmitted(true);
        return didSubmit;
      } finally {
        submissionInFlightRef.current = false;
      }
    },
    [groupId, hasSubmitted, isSubmitting, submitSecondRoundVote],
  );

  const context: AttendanceVoteContext = {
    status,
    selectedChoice: null,
    hasSubmitted,
  };

  return {
    context,
    isLoading,
    isSubmitting,
    error: submissionError ?? groupError,
    submit,
  };
}
