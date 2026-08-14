import clsx from "clsx";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "./fixed-members.module.css";
import type { FixedMemberCandidate } from "../types/assignment.types";

interface UnassignedMemberRowProps {
  member: FixedMemberCandidate;
  onAssign: (member: FixedMemberCandidate) => void;
}

export default function UnassignedMemberRow({
  member,
  onAssign,
}: UnassignedMemberRowProps) {
  const isPublic = member.visibility === "public";

  return (
    <li className={styles.unassignedRow}>
      <GenderAvatar gender={member.gender} name={member.name} size={46} />

      <div className={styles.unassignedInfo}>
        <strong>{member.name}</strong>
        <span>{member.department}</span>
      </div>

      <span
        className={clsx(
          styles.visibilityBadge,
          isPublic ? styles.visibilityPublic : styles.visibilityPrivate,
        )}
      >
        {isPublic ? "공개" : "비공개"}
      </span>

      <button
        type="button"
        className={styles.assignButton}
        aria-label={`${member.name} 조 지정`}
        onClick={() => onAssign(member)}
      >
        조 지정 <span aria-hidden="true">+</span>
      </button>
    </li>
  );
}
