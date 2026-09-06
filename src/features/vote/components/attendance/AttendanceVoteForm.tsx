"use client";

import { useState } from "react";
import Button from "@/shared/ui/Button";
import InfoBanner from "@/shared/ui/InfoBanner";
import { SECOND_ROUND_MIN_PARTICIPANTS } from "../../lib/second-round";
import type { SecondRoundVoteChoice } from "../../types/secondRoundVote.types";
import styles from "../vote.module.css";
import AttendanceOptionCard from "./AttendanceOptionCard";

interface AttendanceVoteFormProps {
  initialChoice: SecondRoundVoteChoice | null;
  isSubmitted: boolean;
  isClosed: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (choice: SecondRoundVoteChoice) => void;
}

export default function AttendanceVoteForm({
  initialChoice,
  isSubmitted,
  isClosed,
  isLoading,
  isSubmitting,
  error,
  onSubmit,
}: AttendanceVoteFormProps) {
  const [selectionState, setSelectionState] = useState(() => ({
    initialChoice,
    selectedChoice: initialChoice,
  }));
  const selectedChoice =
    selectionState.initialChoice === initialChoice
      ? selectionState.selectedChoice
      : initialChoice;
  const locked = isSubmitted || isClosed || isLoading || isSubmitting;
  const isCorrection = initialChoice !== null;
  const isUnchanged = isCorrection && selectedChoice === initialChoice;
  const selectChoice = (choice: SecondRoundVoteChoice) => {
    setSelectionState({ initialChoice, selectedChoice: choice });
  };

  return (
    <form
      className={styles.attendanceForm}
      onSubmit={(event) => {
        event.preventDefault();
        if (selectedChoice && !isUnchanged && !locked) {
          onSubmit(selectedChoice);
        }
      }}
    >
      <div className={styles.attendanceFormContent}>
        <div
          className={styles.attendanceThresholdNotice}
          role="note"
          aria-label="2차 술자리 진행 기준"
        >
          <p>
            2차 참여 희망자가{" "}
            <strong>{SECOND_ROUND_MIN_PARTICIPANTS}명 이상</strong> 모이면{" "}
            <br />
            2차 술자리가 진행됩니다.
          </p>
        </div>

        <div className={styles.attendanceQuestion}>
          <h2>2차 술자리, 함께하실 건가요?</h2>
          <p>참여 여부를 선택해주세요</p>
        </div>

        <fieldset className={styles.attendanceOptions} disabled={locked}>
          <legend className={styles.visuallyHidden}>2차 참여 여부 선택</legend>
          <AttendanceOptionCard
            value="PARTICIPATE"
            label="참여할게요"
            selected={selectedChoice === "PARTICIPATE"}
            disabled={locked}
            onSelect={selectChoice}
          />
          <AttendanceOptionCard
            value="NOT_PARTICIPATE"
            label="불참합니다"
            selected={selectedChoice === "NOT_PARTICIPATE"}
            disabled={locked}
            onSelect={selectChoice}
          />
        </fieldset>

        <InfoBanner
          className={styles.attendanceInfo}
          role="note"
          aria-label="투표 완료 안내"
        >
          <p>투표 완료 후 2차 참여 현황을 확인할 수 있습니다.</p>
        </InfoBanner>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
      </div>

      <div className={styles.voteFooter}>
        <Button
          type="submit"
          disabled={selectedChoice === null || isUnchanged || locked}
        >
          {isSubmitting
            ? isCorrection
              ? "정정 중..."
              : "투표 중..."
            : isSubmitted
              ? isCorrection
                ? "투표 정정됨"
                : "투표 완료됨"
              : isCorrection
                ? "투표 정정하기"
                : "투표 완료하기"}
        </Button>
      </div>
    </form>
  );
}
