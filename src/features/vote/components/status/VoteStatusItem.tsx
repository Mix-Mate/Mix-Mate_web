import { CircleCheck, CircleX } from "lucide-react";
import type { SecondRoundVoteParticipant } from "../../types/secondRoundVoteStatus.types";
import styles from "./VoteStatus.module.css";

interface VoteStatusItemProps {
  member: SecondRoundVoteParticipant;
}

export default function VoteStatusItem({ member }: VoteStatusItemProps) {
  return (
    <li className={styles.statusItem}>
      <strong>{member.displayName}</strong>
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
    </li>
  );
}
