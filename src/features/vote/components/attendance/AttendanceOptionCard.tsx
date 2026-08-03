import { Check } from "lucide-react";
import type { AttendanceChoice } from "../../types/vote.types";
import styles from "../vote.module.css";

interface AttendanceOptionCardProps {
  value: AttendanceChoice;
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: (choice: AttendanceChoice) => void;
}

export default function AttendanceOptionCard({
  value,
  label,
  selected,
  disabled,
  onSelect,
}: AttendanceOptionCardProps) {
  const selectedClassName =
    value === "ABSENT"
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
