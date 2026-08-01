import { ChevronRight } from "lucide-react";
import type { TeamMemberSummary } from "../types/team.types";
import styles from "./team.module.css";

interface TeamMemberItemProps {
  member: TeamMemberSummary;
  onSelect: (member: TeamMemberSummary) => void;
}

export default function TeamMemberItem({
  member,
  onSelect,
}: TeamMemberItemProps) {
  return (
    <li className={styles.memberItem}>
      <button
        type="button"
        className={styles.memberButton}
        onClick={() => onSelect(member)}
        aria-label={`${member.name} 프로필 확인`}
      >
        <span
          className={styles.memberAvatar}
          style={{ backgroundColor: member.avatarColor }}
          aria-hidden="true"
        >
          {member.avatarInitial}
        </span>
        <span className={styles.memberText}>
          <strong>{member.name}</strong>
          <small>{member.department}</small>
        </span>
        <ChevronRight aria-hidden="true" size={18} strokeWidth={1.7} />
      </button>
    </li>
  );
}
