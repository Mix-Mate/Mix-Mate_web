import Avatar from "@/shared/ui/Avatar";
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
        <Avatar
          name={member.name}
          src={member.profileImage}
          fallback={member.avatarInitial}
          backgroundColor={member.avatarColor}
          size={46}
          shape="rounded"
        />
        <span className={styles.memberText}>
          <strong>{member.name}</strong>
          <small>{member.department}</small>
        </span>
      </button>
    </li>
  );
}
