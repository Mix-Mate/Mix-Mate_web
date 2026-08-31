"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGroupDetail } from "@/features/group/api/group.api";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import { voteMvp } from "../api/mvpVote.api";
import { isAlreadyVotedError } from "../api/voteApiError";
import type { MvpCandidate, MvpVoteContext } from "../types/mvpVote.types";
import type { VoteStatus } from "../types/vote.types";

export interface MvpVoteSubmitResult {
  success: boolean;
  isAlreadyVoted?: boolean;
}

export function useMvpVote(groupId: string) {
  const {
    data: team,
    isLoading: isTeamLoading,
    error: teamError,
  } = useMyTeamQuery(groupId, "FIRST_ROUND");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [currentParticipantId, setCurrentParticipantId] = useState<
    number | null
  >(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [status, setStatus] = useState<VoteStatus>("OPEN");
  const submissionInFlightRef = useRef(false);

  useEffect(() => {
    let ignore = false;

    async function fetchCurrentParticipant() {
      setCurrentParticipantId(null);
      setIsGroupLoading(true);
      setGroupError(null);
      setValidationError(null);
      setSubmissionError(null);
      setHasSubmitted(false);
      setStatus("OPEN");

      try {
        const group = await getGroupDetail(groupId);
        if (!ignore) {
          setCurrentParticipantId(group.myParticipantId);
          setStatus(group.status === "VOTING" ? "OPEN" : "CLOSED");
        }
      } catch (fetchError) {
        if (!ignore) {
          setGroupError(
            fetchError instanceof Error
              ? fetchError.message
              : "참가자 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) setIsGroupLoading(false);
      }
    }

    void fetchCurrentParticipant();

    return () => {
      ignore = true;
    };
  }, [groupId]);

  const candidates = useMemo<MvpCandidate[]>(() => {
    if (!team || currentParticipantId === null) return [];

    return team.members
      .filter((member) => member.participantId !== currentParticipantId)
      .map((member) => ({
        participantId: member.participantId,
        name: member.displayName,
        department: member.major,
        gender: member.gender === "FEMALE" ? "female" : "male",
        profileVisibility: member.visibility,
      }));
  }, [currentParticipantId, team]);

  const submit = useCallback(
    async (targetParticipantId: number): Promise<MvpVoteSubmitResult> => {
      if (hasSubmitted || isSubmitting || submissionInFlightRef.current) {
        return { success: false };
      }

      if (
        !candidates.some(
          (candidate) => candidate.participantId === targetParticipantId,
        )
      ) {
        setValidationError(
          "현재 같은 조에 속한 팀원에게만 투표할 수 있습니다.",
        );
        return { success: false };
      }

      setValidationError(null);
      setSubmissionError(null);
      setIsSubmitting(true);
      submissionInFlightRef.current = true;

      try {
        await voteMvp(groupId, targetParticipantId);
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
            : "MVP 투표에 실패했습니다.",
        );
        return { success: false };
      } finally {
        setIsSubmitting(false);
        submissionInFlightRef.current = false;
      }
    },
    [candidates, groupId, hasSubmitted, isSubmitting],
  );

  const context: MvpVoteContext = {
    status,
    currentParticipantId,
    candidates,
    selectedParticipantId: null,
    hasSubmitted,
  };

  return {
    context,
    isLoading: isTeamLoading || isGroupLoading,
    isSubmitting,
    error: submissionError ?? validationError ?? teamError ?? groupError,
    submit,
  };
}
