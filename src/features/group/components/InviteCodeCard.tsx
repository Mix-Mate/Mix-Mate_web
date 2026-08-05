import { Copy, LockKeyhole } from "lucide-react";
import styles from "./admin-preparation.module.css";

interface InviteCodeCardProps {
  inviteCode: string;
  onCopy: () => void;
}

export default function InviteCodeCard({
  inviteCode,
  onCopy,
}: InviteCodeCardProps) {
  return (
    <button
      type="button"
      className={styles.inviteCard}
      onClick={onCopy}
      aria-label={`참여 코드 ${inviteCode} 복사`}
    >
      <span className={styles.inviteInfo}>
        <span className={styles.inviteIcon} aria-hidden="true">
          <LockKeyhole size={20} strokeWidth={1.9} />
        </span>
        <span className={styles.inviteText}>
          <small>참여 코드</small>
          <strong>{inviteCode}</strong>
        </span>
      </span>
      <span className={styles.copyAction}>
        <Copy aria-hidden="true" size={21} strokeWidth={1.9} />
        <strong>복사</strong>
      </span>
    </button>
  );
}
