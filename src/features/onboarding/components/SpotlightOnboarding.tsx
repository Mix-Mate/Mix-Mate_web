"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { useSpotlightPosition } from "../hooks/useSpotlightPosition";
import styles from "./spotlight-onboarding.module.css";

export interface SpotlightStep {
  id: string;
  title: string;
  description: string;
  notes?: readonly string[];
  targetRef: RefObject<HTMLElement | null>;
}

interface SpotlightOnboardingProps {
  steps: readonly SpotlightStep[];
  /** 마지막 단계 완료와 건너뛰기 모두 같은 처리를 한다. */
  onDismiss: () => void;
}

/**
 * 현재 단계의 대상만 밝게 남기고 나머지를 덮는 온보딩 오버레이.
 * 열려 있는 동안만 마운트되므로, 마운트가 곧 첫 단계 시작이다.
 */
export default function SpotlightOnboarding({
  steps,
  onDismiss,
}: SpotlightOnboardingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const coachMarkRef = useRef<HTMLDivElement>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const titleId = useId();
  const descriptionId = useId();

  useSpotlightPosition({
    targetRef: step?.targetRef ?? null,
    containerRef,
    spotlightRef,
    coachMarkRef,
  });

  const goNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      onDismiss();
      return;
    }

    setStepIndex(stepIndex + 1);
  }, [onDismiss, stepIndex, steps.length]);

  // 온보딩 중에는 코치마크 밖으로 포커스가 나가지 않게 해서
  // 기존 화면의 버튼이 키보드로도 눌리지 않도록 한다.
  useEffect(() => {
    const coachMark = coachMarkRef.current;
    coachMark?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== "Tab" || !coachMark) return;

      const focusables =
        coachMark.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && (active === first || active === coachMark)) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  if (!step) return null;

  return (
    <div
      ref={containerRef}
      className={styles.overlay}
      role="presentation"
      data-testid="spotlight-onboarding"
      onClick={goNext}
    >
      <div ref={spotlightRef} className={styles.spotlight} aria-hidden="true" />

      <div
        ref={coachMarkRef}
        className={styles.coachMark}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div key={step.id} className={styles.coachMarkBody}>
          <span className={styles.stepCounter}>
            {stepIndex + 1} / {steps.length}
          </span>
          <h2 id={titleId}>{step.title}</h2>
          <p id={descriptionId}>{step.description}</p>
          {step.notes && step.notes.length > 0 && (
            <ul className={styles.notes}>
              {step.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.skipButton}
            onClick={onDismiss}
          >
            건너뛰기
          </button>
          <button type="button" className={styles.nextButton} onClick={goNext}>
            {isLastStep ? "시작하기" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
