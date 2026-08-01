import styles from "./session.module.css";

interface SessionStatusCardProps {
  eyebrow: string;
  status: string;
}

export default function SessionStatusCard({
  eyebrow,
  status,
}: SessionStatusCardProps) {
  return (
    <section className={styles.statusCard} aria-label="현재 진행 상태">
      <span className={styles.statusDot} />
      <div>
        <p>{eyebrow}</p>
        <strong>{status}</strong>
      </div>
    </section>
  );
}
