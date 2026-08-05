import { SquarePen } from "lucide-react";
import InviteCodeCard from "./InviteCodeCard";
import styles from "./admin-preparation.module.css";

interface AdminGroupSummaryProps {
  statusLabel: string;
  inviteCode: string;
  participantCount: number;
  onCopy: () => void;
  onEditGroup: () => void;
}

export default function AdminGroupSummary({
  statusLabel,
  inviteCode,
  participantCount,
  onCopy,
  onEditGroup,
}: AdminGroupSummaryProps) {
  return (
    <section className={styles.summaryCard} aria-label="그룹 준비 정보">
      <div className={styles.summaryHeader}>
        <p className={styles.statusBadge}>진행 상태 · {statusLabel}</p>
        <button
          type="button"
          className={styles.editSummaryButton}
          onClick={onEditGroup}
        >
          <SquarePen aria-hidden="true" size={14} strokeWidth={2} />
          그룹 정보 편집하기
        </button>
      </div>
      <InviteCodeCard inviteCode={inviteCode} onCopy={onCopy} />
      <span className={styles.srOnly}>현재 참여 인원 {participantCount}명</span>
    </section>
  );
}
