"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import type { Participant } from "../types/participant.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantCardProps {
  participant: Participant;
  groupId?: string;
  round?: AssignmentRound;
  currentParticipantId?: string | null;
  onPrivateSelect?: (participant: Participant) => void;
  canViewPrivateProfiles?: boolean;
  detailFrom?: string;
}

export default function ParticipantCard({
  participant,
  groupId,
  currentParticipantId,
  onPrivateSelect,
  canViewPrivateProfiles = false,
  detailFrom,
}: ParticipantCardProps) {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const resolvedGroupId = groupId ?? params.groupId ?? "1";
  const roleLabel = participant.role === "staff" ? "운영진" : "일반";
  const isPrivateProfile = participant.visibility === "private";
  const isCurrentParticipant = Boolean(
    currentParticipantId && participant.id === currentParticipantId,
  );
  const canViewProfile =
    participant.visibility === "public" ||
    canViewPrivateProfiles ||
    isCurrentParticipant;
  const isMaskedPrivateProfile = isPrivateProfile && !canViewProfile;
  const publicDetailText =
    [participant.grade, roleLabel].filter(Boolean).join(" · ") ||
    participant.department;
  const privateDetailText = participant.grade
    ? [participant.grade, roleLabel].filter(Boolean).join(" · ")
    : "비공개 프로필입니다";
  const detailText = isMaskedPrivateProfile
    ? privateDetailText
    : publicDetailText;
  const listMode = searchParams?.get("list");
  const returnTo = searchParams?.get("returnTo");
  const fromParam = searchParams?.get("from");
  const tabParam = searchParams?.get("tab");
  const resolvedFrom = detailFrom ?? fromParam;
  const profileSearchParams = [
    listMode ? `list=${listMode}` : null,
    returnTo ? `returnTo=${returnTo}` : null,
    tabParam ? `tab=${tabParam}` : null,
    resolvedFrom ? `from=${encodeURIComponent(resolvedFrom)}` : null,
  ].filter(Boolean);
  const profileHref = `/groups/${resolvedGroupId}/participants/${participant.id}${
    profileSearchParams.length > 0 ? `?${profileSearchParams.join("&")}` : ""
  }`;
  const href = isCurrentParticipant
    ? groupRoutes.profile(resolvedGroupId)
    : profileHref;

  const content = (
    <>
      <GenderAvatar
        gender={participant.gender}
        name={participant.name}
        toneKey={participant.id}
        size={46}
      />

      <div className={styles.participantInfo}>
        <div className={styles.nameRow}>
          <strong>{participant.name}</strong>
          {!isMaskedPrivateProfile && participant.role === "staff" && (
            <span className={styles.staffBadge}>운영진</span>
          )}
        </div>
        <span>{detailText}</span>
      </div>

      {isMaskedPrivateProfile && (
        <span className={styles.privateBadge} aria-label="비공개 프로필">
          <Lock aria-hidden="true" size={16} strokeWidth={2} />
        </span>
      )}
    </>
  );

  return (
    <li>
      {canViewProfile ? (
        <Link href={href} className={styles.participantItem}>
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
