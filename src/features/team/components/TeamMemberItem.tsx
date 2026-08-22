import GenderAvatar from "@/shared/ui/GenderAvatar";
import type { TeamMember } from "../types/team.types";
import styles from "./team.module.css";

interface TeamMemberItemProps {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
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
        aria-label={`${member.displayName} 프로필 확인`}
      >
        <GenderAvatar
          gender={member.gender === "FEMALE" ? "female" : "male"}
          name={member.displayName}
          size={46}
        />
        <span className={styles.memberText}>
          <strong>{member.displayName}</strong>
          <small>{member.major}</small>
        </span>
      </button>
    </li>
  );
}
