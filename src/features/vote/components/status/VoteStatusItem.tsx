import { CircleCheck, CircleX } from "lucide-react";
import type { SecondRoundVoteParticipant } from "../../types/secondRoundVoteStatus.types";
import AdminManualVoteControl from "./AdminManualVoteControl";
import styles from "./VoteStatus.module.css";

interface VoteStatusItemProps {
  member: SecondRoundVoteParticipant;
  groupId: string;
  canManageManualVote: boolean;
  onVoteChange: () => void;
}

export default function VoteStatusItem({
  member,
  groupId,
  canManageManualVote,
  onVoteChange,
}: VoteStatusItemProps) {
  const showManualVoteControl = canManageManualVote && member.manualEntry;

  return (
    <li className={styles.statusItem}>
      <strong>{member.displayName}</strong>
      {showManualVoteControl ? (
        <AdminManualVoteControl
          groupId={groupId}
          member={member}
          onVoteChange={onVoteChange}
        />
      ) : (
        <>
          {member.choice === null && (
            <span className={styles.waitingBadge}>대기 중</span>
          )}
          {member.choice === "PARTICIPATE" && (
            <CircleCheck
              className={styles.attendanceIcon}
              aria-label="2차 참여"
              size={18}
              strokeWidth={2}
            />
          )}
          {member.choice === "NOT_PARTICIPATE" && (
            <CircleX
              className={styles.absenceIcon}
              aria-label="불참"
              size={18}
              strokeWidth={2}
            />
          )}
        </>
      )}
    </li>
  );
}
