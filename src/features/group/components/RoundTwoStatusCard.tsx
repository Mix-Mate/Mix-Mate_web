import { SquarePen } from "lucide-react";
import styles from "./admin-preparation.module.css";

interface RoundTwoStatusCardProps {
  eyebrow: string;
  statusLabel: string;
  onEditGroup: () => void;
}

export default function RoundTwoStatusCard({
  eyebrow,
  statusLabel,
  onEditGroup,
}: RoundTwoStatusCardProps) {
  return (
    <section className={styles.roundTwoStatusCard} aria-label="그룹 진행 상태">
      <span className={styles.roundTwoStatusDot} aria-hidden="true" />
      <span className={styles.roundTwoStatusText}>
        <small>{eyebrow}</small>
        <strong>{statusLabel}</strong>
      </span>
      <button
        type="button"
        className={styles.editGroupButton}
        onClick={onEditGroup}
        aria-label="그룹 정보 편집"
      >
        <SquarePen aria-hidden="true" size={18} strokeWidth={2} />
      </button>
    </section>
  );
}
