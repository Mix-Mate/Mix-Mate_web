import clsx from "clsx";
import { Lock, X } from "lucide-react";
import Link from "next/link";
import type { Participant } from "@/features/participant/types/participant.types";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import { toGender } from "../model/assignment.mapper";
import type { AssignmentRound, ParticipantCandidate } from "../types/assignment.types";
import styles from "./fixed-members.module.css";

interface FixedMemberCardProps {
  groupId: string;
  round: AssignmentRound;
  member: ParticipantCandidate;
  teamNumber: number;
  onRemove: (participantId: number) => void;
  onPrivateSelect: (participant: Participant) => void;
}

export default function FixedMemberCard({
  groupId,
  round,
  member,
  teamNumber,
  onRemove,
}: FixedMemberCardProps) {
  const isPrivate = member.visibility === "PRIVATE";

  const content = (
    <>
      <GenderAvatar
        gender={toGender(member.gender)}
        name={member.displayName}
        size={46}
      />

      <div className={styles.fixedInfo}>
        <strong>{member.displayName}</strong>
        <small>{member.major}</small>
      </div>
    </>
  );

  return (
    <div className={styles.fixedRow}>
      <Link
        href={`/groups/${groupId}/participants/${member.participantId}?round=${round}&role=admin`}
        className={styles.fixedRowLink}
      >
        {content}
      </Link>

      <div className={styles.fixedRowActions}>
        {isPrivate && (
          <span
            className={clsx(styles.visibilityBadge, styles.visibilityPrivate)}
            aria-label="비공개"
          >
            <Lock aria-hidden="true" size={16} strokeWidth={2} />
          </span>
        )}
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
