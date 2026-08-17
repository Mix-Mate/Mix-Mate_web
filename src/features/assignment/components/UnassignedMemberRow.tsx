import clsx from "clsx";
import type { ParticipantCandidate } from "../types/assignment.types";
import InitialAvatar from "./InitialAvatar";
import styles from "./fixed-members.module.css";

interface UnassignedMemberRowProps {
  member: ParticipantCandidate;
  onAssign: (member: ParticipantCandidate) => void;
}

export default function UnassignedMemberRow({
  member,
  onAssign,
}: UnassignedMemberRowProps) {
  const isPublic = member.visibility === "PUBLIC";

  return (
    <li className={styles.unassignedRow}>
      <InitialAvatar name={member.displayName} size={46} />

      <div className={styles.unassignedInfo}>
        <strong>{member.displayName}</strong>
        <span>{member.major}</span>
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
        aria-label={`${member.displayName} 조 지정`}
        onClick={() => onAssign(member)}
      >
        조 지정 <span aria-hidden="true">+</span>
      </button>
    </li>
  );
}
