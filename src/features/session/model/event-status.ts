import type { EventStatus } from "../types/session.types";

export type EventStatusStepState = "completed" | "current" | "upcoming";

export interface EventStatusStep {
  key: EventStatus;
  title: string;
  description: string;
}

export const EVENT_STATUS_STEPS = [
  {
    key: "RECRUITING",
    title: "참가자 모집",
    description: "참여코드 발급 · 모집 완료",
  },
  {
    key: "FIRST_PREPARING",
    title: "1차 준비 중",
    description: "조 편성을 시작 할 수 있어요.",
  },
  {
    key: "FIRST_IN_PROGRESS",
    title: "1차 진행 중",
    description: "1차 술자리 시작",
  },
  {
    key: "SECOND_VOTING",
    title: "MVP + 2차 참여 투표",
    description: "1차 종료 시 투표 활성화",
  },
  {
    key: "SECOND_PREPARING",
    title: "2차 준비 중",
    description: "투표 완료자로 조 재편성",
  },
  {
    key: "SECOND_IN_PROGRESS",
    title: "2차 진행 중",
    description: "2차 술자리 시작",
  },
  {
    key: "COMPLETED",
    title: "술자리 종료",
    description: "모임 마무리 및 정산",
  },
] as const satisfies readonly EventStatusStep[];

export function getEventStatusStep(currentStatus: EventStatus) {
  return EVENT_STATUS_STEPS.find((step) => step.key === currentStatus)!;
}

export function getEventStatusLabel(currentStatus: EventStatus) {
  return getEventStatusStep(currentStatus).title;
}

export function getEventStatusStepState(
  currentStatus: EventStatus,
  stepIndex: number,
): EventStatusStepState {
  const currentStepIndex = EVENT_STATUS_STEPS.findIndex(
    (step) => step.key === currentStatus,
  );

  if (stepIndex < currentStepIndex) return "completed";
  if (stepIndex === currentStepIndex) return "current";
  return "upcoming";
}
