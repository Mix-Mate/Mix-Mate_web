import { CircleCheck } from "lucide-react";
import {
  EVENT_STATUS_STEPS,
  getEventStatusStepState,
} from "../model/event-status";
import type { EventStatus } from "../types/session.types";
import styles from "./admin-round-progress.module.css";

interface AdminRoundProgressProps {
  currentStatus: EventStatus;
}

export default function AdminRoundProgress({
  currentStatus,
}: AdminRoundProgressProps) {
  return (
    <ol className={styles.timeline} aria-label="모임 진행 순서">
      {EVENT_STATUS_STEPS.map((step, index) => {
        const state = getEventStatusStepState(currentStatus, index);
        const isCompleted = state === "completed";
        const isCurrent = state === "current";

        return (
          <li
            key={step.key}
            className={`${styles.step} ${styles[state]}`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className={styles.markerColumn} aria-hidden="true">
              <span className={styles.marker}>
                {isCompleted ? (
                  <CircleCheck size={18} strokeWidth={2.2} />
                ) : (
                  index + 1
                )}
              </span>
            </span>

            <span className={styles.stepText}>
              <strong>{step.title}</strong>
              <small>{step.description}</small>
            </span>

            {isCurrent && <span className={styles.currentBadge}>현재</span>}
          </li>
        );
      })}
    </ol>
  );
}
