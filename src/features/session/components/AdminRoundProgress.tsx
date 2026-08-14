import { CircleCheck } from "lucide-react";
import styles from "./admin-round-progress.module.css";

type ProgressStepState = "completed" | "current" | "upcoming";

interface ProgressStep {
  description: string;
  marker?: number;
  state: ProgressStepState;
  title: string;
}

const progressSteps: ProgressStep[] = [
  {
    title: "참가자 모집 중",
    description: "참여코드 발급 · 모집 완료",
    state: "completed",
  },
  {
    title: "1차 진행 중",
    description: "3개 조 · 12명 참여 중",
    marker: 2,
    state: "current",
  },
  {
    title: "MVP + 2차 참여 투표",
    description: "1차 종료 시 투표 활성화",
    marker: 3,
    state: "upcoming",
  },
  {
    title: "2차 준비 중",
    description: "투표 완료자로 조 재편성",
    marker: 4,
    state: "upcoming",
  },
  {
    title: "2차 진행 중",
    description: "2차 술자리 시작",
    marker: 5,
    state: "upcoming",
  },
  {
    title: "술자리 종료",
    description: "모임 마무리 및 정산",
    marker: 6,
    state: "upcoming",
  },
];

export default function AdminRoundProgress() {
  return (
    <ol className={styles.timeline} aria-label="모임 진행 순서">
      {progressSteps.map((step) => (
        <li key={step.title} className={`${styles.step} ${styles[step.state]}`}>
          <span className={styles.markerColumn} aria-hidden="true">
            <span className={`${styles.marker} ${step.state === 'current' ? styles.current : ''}`}>
              {step.state === "completed" ? (
                <CircleCheck size={18} strokeWidth={2.2} />
              ) : (
                step.marker
              )}
            </span>
          </span>

          <span className={styles.stepText}>
            <strong>{step.title}</strong>
            <small>{step.description}</small>
          </span>

          {step.state === "current" && (
            <span className={styles.currentBadge}>현재</span>
          )}
        </li>
      ))}
    </ol>
  );
}
