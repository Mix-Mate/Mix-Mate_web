"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Participant } from "../types/participant.types";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantCardProps {
  participant: Participant;
  groupId?: string;
  onPrivateSelect?: (participant: Participant) => void;
}

export default function ParticipantCard({
  participant,
  groupId,
  onPrivateSelect,
}: ParticipantCardProps) {
  const params = useParams<{ groupId: string }>();
  const resolvedGroupId = groupId ?? params.groupId ?? "1";
  const canViewProfile = participant.visibility === "public";

  const content = (
    <>
      <GenderAvatar gender={participant.gender} name={participant.name} />

      <div className={styles.participantInfo}>
        <strong>{participant.name}</strong>
        <span>{participant.department}</span>
      </div>

      {participant.visibility === "private" && (
        <span className={styles.privateBadge} aria-label="비공개 프로필">
          <Lock aria-hidden="true" size={16} strokeWidth={2} />
        </span>
      )}
    </>
  );

  return (
    <li>
      {canViewProfile ? (
        <Link
          href={`/groups/${resolvedGroupId}/participants/${participant.id}`}
          className={styles.participantItem}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          className={`${styles.participantItem} ${styles.participantButton}`}
          onClick={() => onPrivateSelect?.(participant)}
        >
          {content}
        </button>
      )}
    </li>
  );
}
