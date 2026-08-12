"use client";

import { Minus, Plus } from "lucide-react";
import styles from "./assignment.module.css";

interface GroupCountStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function GroupCountStepper({
  value,
  min = 2,
  max = 20,
  onChange,
}: GroupCountStepperProps) {
  return (
    <div className={styles.stepperRow} role="group" aria-label="조 개수 설정">
      <button
        type="button"
        className={styles.stepButton}
        aria-label="조 개수 줄이기"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus aria-hidden="true" size={20} strokeWidth={2.4} />
      </button>
      <p className={styles.countText} aria-live="polite">
        <span>{value}</span>
        <small>개 조</small>
      </p>
      <button
        type="button"
        className={styles.stepButton}
        aria-label="조 개수 늘리기"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus aria-hidden="true" size={20} strokeWidth={2.4} />
      </button>
    </div>
  );
}
