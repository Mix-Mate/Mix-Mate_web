import { X } from "lucide-react";
import Avatar from "@/shared/ui/Avatar";
import { getAvatarColor } from "./avatarColors";
import styles from "./fixed-members.module.css";
import type { FixedMemberCandidate } from "../types/assignment.types";

const roleLabel: Record<FixedMemberCandidate["role"], string> = {
  general: "일반",
  staff: "운영진",
};

interface FixedMemberCardProps {
  member: FixedMemberCandidate;
  onRemove: (memberId: string) => void;
}

export default function FixedMemberCard({
  member,
  onRemove,
}: FixedMemberCardProps) {
  return (
    <div className={styles.fixedRow}>
      <Avatar
        name={member.name}
        size={39}
        backgroundColor={getAvatarColor(member.id)}
      />

      <div className={styles.fixedInfo}>
        <strong>{member.name}</strong>
        <small>
          {member.grade} · {roleLabel[member.role]}
        </small>
      </div>

      <div className={styles.fixedRowActions}>
        <span className={styles.fixedTeamBadge}>
          {member.fixedTeamNumber}조 고정
        </span>
        <button
          type="button"
          className={styles.removeFixedButton}
          aria-label={`${member.name} 고정 해제`}
          onClick={() => onRemove(member.id)}
        >
          <X aria-hidden="true" size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
