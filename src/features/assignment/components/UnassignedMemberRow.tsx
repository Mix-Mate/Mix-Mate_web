import clsx from "clsx";
import { Lock } from "lucide-react";
import Link from "next/link";
import type { Participant } from "@/features/participant/types/participant.types";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import { toGender } from "../model/assignment.mapper";
import type { AssignmentRound, ParticipantCandidate } from "../types/assignment.types";
import styles from "./fixed-members.module.css";

interface UnassignedMemberRowProps {
  groupId: string;
  round: AssignmentRound;
  member: ParticipantCandidate;
  onAssign: (member: ParticipantCandidate) => void;
  onPrivateSelect: (participant: Participant) => void;
}

export default function UnassignedMemberRow({
  groupId,
  round,
  member,
  onAssign,
}: UnassignedMemberRowProps) {
  const isPrivate = member.visibility === "PRIVATE";

  const content = (
    <>
      <GenderAvatar
        gender={toGender(member.gender)}
        name={member.displayName}
        size={46}
      />

      <div className={styles.unassignedInfo}>
        <strong>{member.displayName}</strong>
        <span>{member.major}</span>
      </div>
    </>
  );

  return (
    <li className={styles.unassignedRow}>
      <Link
        href={`/groups/${groupId}/participants/${member.participantId}?round=${round}&role=admin`}
        className={styles.unassignedRowLink}
      >
        {content}
      </Link>

      {isPrivate && (
        <span
          className={clsx(styles.visibilityBadge, styles.visibilityPrivate)}
          aria-label="비공개"
        >
          <Lock aria-hidden="true" size={16} strokeWidth={2} />
        </span>
      )}

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
