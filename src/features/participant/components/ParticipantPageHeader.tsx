"use client";

import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantPageHeaderProps {
  groupName?: string;
  participantCount: number;
  title?: string;
  backHref?: string;
  backLabel?: string;
}

export default function ParticipantPageHeader({
  groupName,
  participantCount,
  title = "참가자 목록",
  backHref,
  backLabel = "그룹 홈으로 이동",
}: ParticipantPageHeaderProps) {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backButton}
        aria-label={backLabel}
        onClick={() =>
          router.push(backHref ?? `/groups/${params.groupId}/home`)
        }
      >
        <ChevronLeft aria-hidden="true" size={24} strokeWidth={1.7} />
      </button>

      <div className={styles.titleArea}>
        <h1>{title}</h1>
        <p>
          {groupName ? `${groupName} · ` : ""}
          {participantCount}명
        </p>
      </div>
    </header>
  );
}
