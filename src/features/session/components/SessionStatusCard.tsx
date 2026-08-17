import type { ReactNode } from "react";
import styles from "./session.module.css";

interface SessionStatusCardProps {
  eyebrow: string;
  status: string;
  onClick?: () => void;
  action?: {
    ariaLabel: string;
    icon: ReactNode;
    onClick: () => void;
  };
}

export default function SessionStatusCard({
  eyebrow,
  status,
  onClick,
  action,
}: SessionStatusCardProps) {
  const content = (
    <>
      <span className={styles.statusDot} aria-hidden="true" />
      <div>
        <p>{eyebrow}</p>
        <strong>{status}</strong>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.statusCard} ${styles.statusCardButton}`}
        aria-label={`${status}, 진행 현황 보기`}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <section
      className={`${styles.statusCard} ${
        action ? styles.statusCardWithAction : ""
      }`.trim()}
      aria-label="현재 진행 상태"
    >
      {content}
      {action && (
        <button
          type="button"
          className={styles.statusAction}
          aria-label={action.ariaLabel}
          onClick={action.onClick}
        >
          {action.icon}
        </button>
      )}
    </section>
  );
}
