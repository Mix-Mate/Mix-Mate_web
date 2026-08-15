"use client";

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

      <span
        className={
          participant.visibility === "public"
            ? styles.publicBadge
            : styles.privateBadge
        }
      >
        {participant.visibility === "public" ? "공개" : "비공개"}
      </span>
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