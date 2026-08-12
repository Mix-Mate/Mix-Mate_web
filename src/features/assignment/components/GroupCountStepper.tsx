"use client";

import { Minus, Plus } from "lucide-react";
import Button from "@/shared/ui/Button";

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
    <div role="group" aria-label="조 개수 설정">
      <Button
        type="button"
        variant="secondary"
        aria-label="조 개수 줄이기"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus aria-hidden="true" size={18} />
      </Button>
      <span aria-live="polite">{value}조</span>
      <Button
        type="button"
        variant="secondary"
        aria-label="조 개수 늘리기"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus aria-hidden="true" size={18} />
      </Button>
    </div>
  );
}
