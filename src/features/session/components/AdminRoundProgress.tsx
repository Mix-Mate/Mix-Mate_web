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
    title: "참가자 목록 확인",
    description: "전체 참가자 확인",
    state: "completed",
  },
  {
    title: "조 편성 시작",
    description: "자동 자리 배치 조건 설정 완료",
    state: "completed",
  },
  {
    title: "1차 조 편성 확정",
    description: "3개 조 · 12명",
    state: "completed",
  },
  {
    title: "1차 술자리 종료",
    description: "종료 시 투표 화면 활성화",
    marker: 2,
    state: "current",
  },
  {
    title: "MVP 투표 + 2차 참여 투표",
    description: "투표 종료 후 결과 확정",
    marker: 3,
    state: "upcoming",
  },
  {
    title: "2차 조 편성",
    description: "투표 완료자로 재배치",
    marker: 4,
    state: "upcoming",
  },
];

export default function AdminRoundProgress() {
  return (
    <ol className={styles.timeline} aria-label="모임 진행 순서">
      {progressSteps.map((step) => (
        <li
          key={step.title}
          className={`${styles.step} ${styles[step.state]}`}
        >
          <span className={styles.markerColumn} aria-hidden="true">
            <span className={styles.marker}>
              {step.state === "completed" ? (
                <CircleCheck size={19} strokeWidth={2.2} />
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
