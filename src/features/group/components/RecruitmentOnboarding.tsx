"use client";

import { Info } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Button from "@/shared/ui/Button";
import styles from "./recruitment-onboarding.module.css";

const SPOTLIGHT_PADDING = 6;
const COACH_GAP = 12;
const COACH_SIDE_MARGIN = 16;
const COACH_VERTICAL_MARGIN = 12;
const FALLBACK_COACH_HEIGHT = 190;

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  additionalDescription?: string;
}

const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    target: "status",
    title: "모임의 진행 상태를 확인해요",
    description: "현재 모임이 어느 단계인지 한눈에 확인할 수 있어요.",
  },
  {
    target: "invite-code",
    title: "참가자를 초대해요",
    description:
      "그룹 코드를 복사해 공유하면 참가자가 모임에 참여할 수 있어요.",
  },
  {
    target: "recruiting-status",
    title: "참가자를 기다려요",
    description:
      "초대한 참가자가 들어오면 이곳에서 모집 현황을 확인할 수 있어요.",
  },
  {
    target: "participants",
    title: "참가자를 확인하고 관리해요",
    description:
      "현재 참여 인원을 확인하고, 눌러서 참가자 목록을 확인하거나 참가자를 직접 추가할 수 있어요.",
  },
  {
    target: "close-recruitment",
    title: "모두 모였다면 모집을 마감해요",
    description:
      "참가자가 모두 모이면 모집을 마감하고 다음 단계로 진행할 수 있어요.",
    additionalDescription:
      "참가자가 4명 이상 모이면 모집을 마감할 수 있어요.",
  },
];

type CoachPlacement = "above" | "below";

interface OnboardingGeometry {
  spotlightTop: number;
  spotlightLeft: number;
  spotlightWidth: number;
  spotlightHeight: number;
  spotlightRadius: number;
  coachTop: number;
  coachLeft: number;
  arrowLeft: number;
  placement: CoachPlacement;
}

type CoachStyle = CSSProperties & {
  "--coach-arrow-left": string;
};

interface RecruitmentOnboardingProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function isSameGeometry(
  previous: OnboardingGeometry | null,
  next: OnboardingGeometry,
) {
  if (!previous || previous.placement !== next.placement) return false;

  return (
    Math.abs(previous.spotlightTop - next.spotlightTop) < 0.5 &&
    Math.abs(previous.spotlightLeft - next.spotlightLeft) < 0.5 &&
    Math.abs(previous.spotlightWidth - next.spotlightWidth) < 0.5 &&
    Math.abs(previous.spotlightHeight - next.spotlightHeight) < 0.5 &&
    Math.abs(previous.spotlightRadius - next.spotlightRadius) < 0.5 &&
    Math.abs(previous.coachTop - next.coachTop) < 0.5 &&
    Math.abs(previous.coachLeft - next.coachLeft) < 0.5 &&
    Math.abs(previous.arrowLeft - next.arrowLeft) < 0.5
  );
}

export default function RecruitmentOnboarding({
  open,
  onComplete,
  onSkip,
}: RecruitmentOnboardingProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const coachRef = useRef<HTMLElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [geometry, setGeometry] = useState<OnboardingGeometry | null>(null);
  const step = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  const getTarget = useCallback(() => {
    const screen = overlayRef.current?.parentElement;

    return screen?.querySelector<HTMLElement>(
      `[data-recruitment-onboarding-target="${step.target}"]`,
    );
  }, [step.target]);

  const updateGeometry = useCallback(() => {
    const overlay = overlayRef.current;
    const target = getTarget();
    if (!overlay || !target) return;

    const overlayRect = overlay.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const overlayWidth = overlayRect.width || overlay.clientWidth;
    const overlayHeight = overlayRect.height || overlay.clientHeight;
    const spotlightLeft = clamp(
      targetRect.left - overlayRect.left - SPOTLIGHT_PADDING,
      0,
      overlayWidth,
    );
    const spotlightTop = clamp(
      targetRect.top - overlayRect.top - SPOTLIGHT_PADDING,
      0,
      overlayHeight,
    );
    const spotlightRight = clamp(
      targetRect.right - overlayRect.left + SPOTLIGHT_PADDING,
      spotlightLeft,
      overlayWidth,
    );
    const spotlightBottom = clamp(
      targetRect.bottom - overlayRect.top + SPOTLIGHT_PADDING,
      spotlightTop,
      overlayHeight,
    );
    const spotlightWidth = spotlightRight - spotlightLeft;
    const spotlightHeight = spotlightBottom - spotlightTop;
    const targetRadius =
      Number.parseFloat(
        window.getComputedStyle(target).borderTopLeftRadius,
      ) || 16;
    const spotlightRadius = targetRadius + SPOTLIGHT_PADDING;
    const measuredCoachHeight =
      coachRef.current?.getBoundingClientRect().height ||
      FALLBACK_COACH_HEIGHT;
    const coachWidth = Math.max(
      0,
      Math.min(358, overlayWidth - COACH_SIDE_MARGIN * 2),
    );
    const spaceAbove = spotlightTop - COACH_VERTICAL_MARGIN;
    const spaceBelow =
      overlayHeight - spotlightBottom - COACH_VERTICAL_MARGIN;
    const requiredCoachSpace = measuredCoachHeight + COACH_GAP;
    const placement: CoachPlacement =
      spaceBelow >= requiredCoachSpace || spaceBelow >= spaceAbove
        ? "below"
        : "above";
    const rawCoachTop =
      placement === "below"
        ? spotlightBottom + COACH_GAP
        : spotlightTop - measuredCoachHeight - COACH_GAP;
    const coachTop = clamp(
      rawCoachTop,
      COACH_VERTICAL_MARGIN,
      overlayHeight - measuredCoachHeight - COACH_VERTICAL_MARGIN,
    );
    const spotlightCenter = spotlightLeft + spotlightWidth / 2;
    const coachLeft = clamp(
      spotlightCenter - coachWidth / 2,
      COACH_SIDE_MARGIN,
      overlayWidth - coachWidth - COACH_SIDE_MARGIN,
    );
    const arrowLeft = clamp(
      spotlightCenter - coachLeft,
      24,
      coachWidth - 24,
    );
    const nextGeometry: OnboardingGeometry = {
      spotlightTop,
      spotlightLeft,
      spotlightWidth,
      spotlightHeight,
      spotlightRadius,
      coachTop,
      coachLeft,
      arrowLeft,
      placement,
    };

    setGeometry((previous) =>
      isSameGeometry(previous, nextGeometry) ? previous : nextGeometry,
    );
  }, [getTarget]);

  useLayoutEffect(() => {
    if (!open) return;

    const target = getTarget();
    const overlay = overlayRef.current;
    if (!target || !overlay) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    target.scrollIntoView?.({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest",
    });
    updateGeometry();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateGeometry);
    resizeObserver?.observe(overlay);
    resizeObserver?.observe(target);
    if (coachRef.current) resizeObserver?.observe(coachRef.current);

    window.addEventListener("resize", updateGeometry);
    window.addEventListener("scroll", updateGeometry, true);
    window.visualViewport?.addEventListener("resize", updateGeometry);
    window.visualViewport?.addEventListener("scroll", updateGeometry);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateGeometry);
      window.removeEventListener("scroll", updateGeometry, true);
      window.visualViewport?.removeEventListener("resize", updateGeometry);
      window.visualViewport?.removeEventListener("scroll", updateGeometry);
    };
  }, [getTarget, open, stepIndex, updateGeometry]);

  useEffect(() => {
    if (!open) return;
    nextButtonRef.current?.focus({ preventScroll: true });
  }, [open, stepIndex]);

  if (!open) return null;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    setStepIndex((currentStep) => currentStep + 1);
  };

  const handleCoachKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onSkip();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = Array.from(
      coachRef.current?.querySelectorAll<HTMLButtonElement>(
        "button:not(:disabled)",
      ) ?? [],
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const spotlightStyle: CSSProperties | undefined = geometry
    ? {
        top: geometry.spotlightTop,
        left: geometry.spotlightLeft,
        width: geometry.spotlightWidth,
        height: geometry.spotlightHeight,
        borderRadius: geometry.spotlightRadius,
      }
    : undefined;
  const coachStyle: CoachStyle | undefined = geometry
    ? {
        top: geometry.coachTop,
        left: geometry.coachLeft,
        "--coach-arrow-left": `${geometry.arrowLeft}px`,
      }
    : undefined;

  return (
    <div
      ref={overlayRef}
      className={`${styles.overlay} ${geometry ? styles.ready : ""}`.trim()}
      data-testid="recruitment-onboarding"
      data-step={stepIndex + 1}
      data-target={step.target}
    >
      <span
        className={styles.spotlight}
        style={spotlightStyle}
        aria-hidden="true"
      />

      <button
        type="button"
        className={styles.advanceSurface}
        aria-label={isLastStep ? "온보딩 완료" : "다음 안내 보기"}
        tabIndex={-1}
        onClick={handleNext}
      />

      <section
        ref={coachRef}
        className={styles.coachMark}
        style={coachStyle}
        data-placement={geometry?.placement}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recruitment-onboarding-title"
        aria-describedby="recruitment-onboarding-description"
        onKeyDown={handleCoachKeyDown}
      >
        <span className={styles.coachArrow} aria-hidden="true" />

        <div key={step.target} className={styles.coachContent}>
          <div className={styles.coachHeader}>
            <span className={styles.stepCount}>
              {stepIndex + 1} / {ONBOARDING_STEPS.length}
            </span>
            <button
              type="button"
              className={styles.skipButton}
              onClick={onSkip}
            >
              건너뛰기
            </button>
          </div>

          <h2 id="recruitment-onboarding-title">{step.title}</h2>
          <p id="recruitment-onboarding-description">{step.description}</p>

          {step.additionalDescription && (
            <p className={styles.additionalDescription}>
              <Info aria-hidden="true" size={16} strokeWidth={2.2} />
              <span>{step.additionalDescription}</span>
            </p>
          )}

          <Button
            ref={nextButtonRef}
            className={styles.nextButton}
            onClick={handleNext}
          >
            {isLastStep ? "시작하기" : "다음"}
          </Button>
        </div>
      </section>
    </div>
  );
}
