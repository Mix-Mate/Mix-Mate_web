import styles from "./session.module.css";

interface SessionStatusCardProps {
  eyebrow: string;
  status: string;
  onClick?: () => void;
}

export default function SessionStatusCard({
  eyebrow,
  status,
  onClick,
}: SessionStatusCardProps) {
  const content = (
    <>
      <span className={styles.statusDot} />
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
    <section className={styles.statusCard} aria-label="현재 진행 상태">
      {content}
    </section>
  );
}
