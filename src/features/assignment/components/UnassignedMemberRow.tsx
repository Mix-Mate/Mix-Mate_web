import clsx from "clsx";
import Avatar from "@/shared/ui/Avatar";
import { getAvatarColor } from "./avatarColors";
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
      <Avatar
        name={member.name}
        size={46}
        backgroundColor={getAvatarColor(member.id)}
      />

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
        onClick={() => onAssign(member)}
      >
        조 지정 <span aria-hidden="true">+</span>
      </button>
    </li>
  );
}
