import { X } from "lucide-react";
import type { ParticipantCandidate } from "../types/assignment.types";
import InitialAvatar from "./InitialAvatar";
import styles from "./fixed-members.module.css";

interface FixedMemberCardProps {
  member: ParticipantCandidate;
  teamNumber: number;
  onRemove: (participantId: number) => void;
}

export default function FixedMemberCard({
  member,
  teamNumber,
  onRemove,
}: FixedMemberCardProps) {
  return (
    <div className={styles.fixedRow}>
      <InitialAvatar name={member.displayName} size={46} />

      <div className={styles.fixedInfo}>
        <strong>{member.displayName}</strong>
        <small>{member.major}</small>
      </div>

      <div className={styles.fixedRowActions}>
        <span className={styles.fixedTeamBadge}>{teamNumber}조 고정</span>
        <button
          type="button"
          className={styles.removeFixedButton}
          aria-label={`${member.displayName} 고정 해제`}
          onClick={() => onRemove(member.participantId)}
        >
          <X aria-hidden="true" size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
