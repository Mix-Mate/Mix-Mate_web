"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import Button from "@/shared/ui/Button";
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
  const [selectedChoice, setSelectedChoice] = useState(initialChoice);
  const locked = isSubmitted || isClosed || isLoading || isSubmitting;

  return (
    <form
      className={styles.attendanceForm}
      onSubmit={(event) => {
        event.preventDefault();
        if (selectedChoice && !locked) {
          onSubmit(selectedChoice);
        }
      }}
    >
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
          onSelect={setSelectedChoice}
        />
        <AttendanceOptionCard
          value="NOT_PARTICIPATE"
          label="불참합니다"
          selected={selectedChoice === "NOT_PARTICIPATE"}
          disabled={locked}
          onSelect={setSelectedChoice}
        />
      </fieldset>

      <p className={styles.attendanceInfo}>
        <Info aria-hidden="true" size={15} strokeWidth={1.8} />
        투표 완료 후 2차 참여 현황을 확인할 수 있습니다.
      </p>

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className={styles.submitButton}
        disabled={selectedChoice === null || locked}
      >
        {isSubmitting
          ? "투표 중..."
          : isSubmitted
            ? "투표 완료됨"
            : "투표 완료하기"}
      </Button>
    </form>
  );
}
