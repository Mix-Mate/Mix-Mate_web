"use client";

import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantPageHeaderProps {
  groupName: string;
  participantCount: number;
}

export default function ParticipantPageHeader({
  groupName,
  participantCount,
}: ParticipantPageHeaderProps) {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.backButton}
        aria-label="그룹 홈으로 이동"
        onClick={() => router.push(`/groups/${params.groupId}/home`)}
      >
        <ChevronLeft aria-hidden="true" size={27} strokeWidth={2} />
      </button>

      <div className={styles.titleArea}>
        <h1>참가자 목록</h1>
        <p>
          {groupName} · {participantCount}명
        </p>
      </div>
    </header>
  );
}
