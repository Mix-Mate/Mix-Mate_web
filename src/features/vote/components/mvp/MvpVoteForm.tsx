"use client";

import { Info, Trophy } from "lucide-react";
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
      <div className={styles.mvpFormContent}>
        <header className={styles.introCard}>
          <Trophy
            className={styles.introIcon}
            aria-hidden="true"
            size={30}
            strokeWidth={1.7}
          />
          <h2>오늘의 분위기 메이커는?</h2>
          <p>
            1차 술자리를 가장 빛낸 사람에게 투표해 주세요.
            <br />
            같은 조 멤버 중 한 명만 선택할 수 있어요.
          </p>
        </header>

        <aside className={styles.ruleNotice}>
          <Info aria-hidden="true" size={16} strokeWidth={1.8} />
          <p>
            자신에게는 투표할 수 없습니다.
            <br />
            개별 투표는 공개되지 않습니다.
          </p>
        </aside>

        <div className={styles.mvpSelection}>
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
        </div>
      </div>

      <div className={styles.voteFooter}>
        <Button type="submit" disabled={!canContinue}>
          {isSubmitting ? "투표 중..." : "다음 - 2차 참여 여부 투표 →"}
        </Button>
      </div>
    </form>
  );
}
