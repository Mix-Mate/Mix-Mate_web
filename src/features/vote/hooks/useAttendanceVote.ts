"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGroupDetail } from "@/features/group/api/group.api";
import { voteSecondRound } from "../api/secondRoundVote.api";
import { isAlreadyVotedError } from "../api/voteApiError";
import type {
  AttendanceVoteContext,
  SecondRoundVoteChoice,
} from "../types/secondRoundVote.types";
import type { VoteStatus } from "../types/vote.types";

export interface AttendanceVoteSubmitResult {
  success: boolean;
  isAlreadyVoted?: boolean;
}

export function useAttendanceVote(groupId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
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
      setSubmissionError(null);
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
    async (choice: SecondRoundVoteChoice): Promise<AttendanceVoteSubmitResult> => {
      if (hasSubmitted || isSubmitting || submissionInFlightRef.current) {
        return { success: false };
      }

      setSubmissionError(null);
      setIsSubmitting(true);
      submissionInFlightRef.current = true;

      try {
        await voteSecondRound(groupId, choice);
        setHasSubmitted(true);
        return { success: true };
      } catch (submitError) {
        if (isAlreadyVotedError(submitError)) {
          setHasSubmitted(true);
          return { success: false, isAlreadyVoted: true };
        }
        setSubmissionError(
          submitError instanceof Error
            ? submitError.message
            : "2차 참여 여부 투표에 실패했습니다.",
        );
        return { success: false };
      } finally {
        setIsSubmitting(false);
        submissionInFlightRef.current = false;
      }
    },
    [groupId, hasSubmitted, isSubmitting],
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
