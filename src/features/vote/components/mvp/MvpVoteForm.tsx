"use client";

import { useState } from "react";
import type { MvpCandidate } from "../../types/vote.types";
import styles from "../vote.module.css";
import MvpCandidateList from "./MvpCandidateList";

interface MvpVoteFormProps {
  candidates: MvpCandidate[];
  initialCandidateId: string | null;
  isSubmitted: boolean;
  isClosed: boolean;
  error: string | null;
  onSubmit: (candidateId: string) => void;
}

export default function MvpVoteForm({
  candidates,
  initialCandidateId,
  isSubmitted,
  isClosed,
  error,
  onSubmit,
}: MvpVoteFormProps) {
  const [selectedCandidateId, setSelectedCandidateId] =
    useState(initialCandidateId);
  const selectedCandidate = candidates.find(
    (candidate) => candidate.id === selectedCandidateId,
  );
  const canContinue = selectedCandidateId !== null && !isClosed;

  return (
    <form
      className={styles.mvpForm}
      onSubmit={(event) => {
        event.preventDefault();
        if (selectedCandidateId) {
          onSubmit(selectedCandidateId);
        }
      }}
    >
      <MvpCandidateList
        candidates={candidates}
        selectedCandidateId={selectedCandidateId}
        disabled={isSubmitted || isClosed}
        onSelect={setSelectedCandidateId}
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

      <button
        type="submit"
        className={styles.submitButton}
        disabled={!canContinue}
      >
        다음 - 2차 참여 여부 투표 →
      </button>
    </form>
  );
}
