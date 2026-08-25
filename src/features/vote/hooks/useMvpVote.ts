"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGroupDetail } from "@/features/group/api/group.api";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import type { MvpCandidate, MvpVoteContext } from "../types/mvpVote.types";
import type { VoteStatus } from "../types/vote.types";
import { useMvpVoteMutation } from "./useMvpVoteMutation";

export function useMvpVote(groupId: string) {
  const {
    data: team,
    isLoading: isTeamLoading,
    error: teamError,
  } = useMyTeamQuery(groupId, "FIRST_ROUND");
  const {
    mutate: submitMvpVote,
    isPending: isSubmitting,
    error: submissionError,
  } = useMvpVoteMutation();
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
    async (targetParticipantId: number) => {
      if (hasSubmitted || isSubmitting || submissionInFlightRef.current) {
        return false;
      }

      if (
        !candidates.some(
          (candidate) => candidate.participantId === targetParticipantId,
        )
      ) {
        setValidationError(
          "현재 같은 조에 속한 팀원에게만 투표할 수 있습니다.",
        );
        return false;
      }

      setValidationError(null);
      submissionInFlightRef.current = true;

      try {
        const didSubmit = await submitMvpVote(groupId, targetParticipantId);

        if (didSubmit) setHasSubmitted(true);
        return didSubmit;
      } finally {
        submissionInFlightRef.current = false;
      }
    },
    [candidates, groupId, hasSubmitted, isSubmitting, submitMvpVote],
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
