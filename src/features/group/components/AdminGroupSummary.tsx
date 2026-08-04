import InviteCodeCard from "./InviteCodeCard";
import styles from "./admin-preparation.module.css";

interface AdminGroupSummaryProps {
  statusLabel: string;
  inviteCode: string;
  participantCount: number;
  onCopy: () => void;
}

export default function AdminGroupSummary({
  statusLabel,
  inviteCode,
  participantCount,
  onCopy,
}: AdminGroupSummaryProps) {
  return (
    <section className={styles.summaryCard} aria-label="그룹 준비 정보">
      <p className={styles.statusBadge}>진행 상태 · {statusLabel}</p>
      <InviteCodeCard inviteCode={inviteCode} onCopy={onCopy} />
      <span className={styles.srOnly}>현재 참여 인원 {participantCount}명</span>
    </section>
  );
}
