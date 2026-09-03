"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import type { Participant } from "../types/participant.types";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantCardProps {
  participant: Participant;
  groupId?: string;
  round?: AssignmentRound;
  onPrivateSelect?: (participant: Participant) => void;
  canViewPrivateProfiles?: boolean;
}

export default function ParticipantCard({
  participant,
  groupId,
  round,
  onPrivateSelect,
  canViewPrivateProfiles = false,
}: ParticipantCardProps) {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const resolvedGroupId = groupId ?? params.groupId ?? "1";
  const canViewProfile =
    participant.visibility === "public" || canViewPrivateProfiles;
  const listMode = searchParams?.get("list");
  const returnTo = searchParams?.get("returnTo");
  const profileSearchParams = [
    round ? `round=${round}` : null,
    canViewPrivateProfiles ? "role=admin" : null,
    listMode ? `list=${listMode}` : null,
    returnTo ? `returnTo=${returnTo}` : null,
  ].filter(Boolean);
  const profileHref = `/groups/${resolvedGroupId}/participants/${participant.id}${
    profileSearchParams.length > 0 ? `?${profileSearchParams.join("&")}` : ""
  }`;

  const content = (
    <>
      <GenderAvatar
        gender={participant.gender}
        name={participant.name}
        toneKey={participant.id}
      />

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
          href={profileHref}
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
