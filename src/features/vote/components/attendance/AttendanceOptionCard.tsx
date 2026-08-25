import { Check } from "lucide-react";
import type { SecondRoundVoteChoice } from "../../types/secondRoundVote.types";
import styles from "../vote.module.css";

interface AttendanceOptionCardProps {
  value: SecondRoundVoteChoice;
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: (choice: SecondRoundVoteChoice) => void;
}

export default function AttendanceOptionCard({
  value,
  label,
  selected,
  disabled,
  onSelect,
}: AttendanceOptionCardProps) {
  const selectedClassName =
    value === "NOT_PARTICIPATE"
      ? styles.selectedAbsentAttendance
      : styles.selectedAttendance;

  return (
    <label
      className={`${styles.attendanceOption} ${
        selected ? selectedClassName : ""
      }`}
    >
      <input
        className={styles.visuallyHidden}
        type="radio"
        name="attendance-choice"
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(value)}
      />
      <span className={styles.optionMark} aria-hidden="true">
        {selected && <Check size={20} strokeWidth={2.2} />}
      </span>
      <strong>{label}</strong>
    </label>
  );
}
