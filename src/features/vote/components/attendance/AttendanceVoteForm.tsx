"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import Button from "@/shared/ui/Button";
import type { AttendanceChoice } from "../../types/vote.types";
import styles from "../vote.module.css";
import AttendanceOptionCard from "./AttendanceOptionCard";

interface AttendanceVoteFormProps {
  initialChoice: AttendanceChoice | null;
  isSubmitted: boolean;
  isClosed: boolean;
  error: string | null;
  onSubmit: (choice: AttendanceChoice) => void;
}

export default function AttendanceVoteForm({
  initialChoice,
  isSubmitted,
  isClosed,
  error,
  onSubmit,
}: AttendanceVoteFormProps) {
  const [selectedChoice, setSelectedChoice] = useState(initialChoice);
  const locked = isSubmitted || isClosed;

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
          value="ATTEND"
          label="참여할게요"
          selected={selectedChoice === "ATTEND"}
          disabled={locked}
          onSelect={setSelectedChoice}
        />
        <AttendanceOptionCard
          value="ABSENT"
          label="불참합니다"
          selected={selectedChoice === "ABSENT"}
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
        {isSubmitted ? "투표 완료됨" : "투표 완료하기"}
      </Button>
    </form>
  );
}
