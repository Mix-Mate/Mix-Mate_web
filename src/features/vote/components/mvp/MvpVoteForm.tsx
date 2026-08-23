"use client";

import { useState } from "react";
import Button from "@/shared/ui/Button";
import type { MvpCandidate } from "../../types/mvpVote.types";
import styles from "../vote.module.css";
import MvpCandidateList from "./MvpCandidateList";

interface MvpVoteFormProps {
  candidates: MvpCandidate[];
  initialParticipantId: number | null;
  isSubmitted: boolean;
  isClosed: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (targetParticipantId: number) => void;
}

export default function MvpVoteForm({
  candidates,
  initialParticipantId,
  isSubmitted,
  isClosed,
  isLoading,
  isSubmitting,
  error,
  onSubmit,
}: MvpVoteFormProps) {
  const [selectedParticipantId, setSelectedParticipantId] =
    useState(initialParticipantId);
  const selectedCandidate = candidates.find(
    (candidate) => candidate.participantId === selectedParticipantId,
  );
  const canContinue =
    selectedParticipantId !== null &&
    !isSubmitted &&
    !isClosed &&
    !isLoading &&
    !isSubmitting;

  return (
    <form
      className={styles.mvpForm}
      onSubmit={(event) => {
        event.preventDefault();
        if (selectedParticipantId !== null) {
          onSubmit(selectedParticipantId);
        }
      }}
    >
      <MvpCandidateList
        candidates={candidates}
        selectedParticipantId={selectedParticipantId}
        disabled={isSubmitted || isClosed || isLoading || isSubmitting}
        onSelect={setSelectedParticipantId}
      />

      {selectedCandidate && (
        <p className={styles.selectionNotice} aria-live="polite">
          <span aria-hidden="true" />
          {selectedCandidate.name}님을 MVP로 선택했습니다.
        </p>
      )}

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className={styles.submitButton}
        disabled={!canContinue}
      >
        {isSubmitting ? "투표 중..." : "다음 - 2차 참여 여부 투표 →"}
      </Button>
    </form>
  );
}
