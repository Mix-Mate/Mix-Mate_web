"use client";

import { useMemo, useState } from "react";
import { Ban, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGroupBlacklistQuery } from "@/features/blacklist/hooks/useGroupBlacklistQuery";
import type { BlockedParticipant } from "@/features/blacklist/types/blacklist.types";
import BlockedUserList from "@/features/blacklist/components/BlockedUserList";
import BlockedUserProfileModal from "@/features/blacklist/components/BlockedUserProfileModal";
import AdminAccessGuard from "@/features/session/components/AdminAccessGuard";
import MobileFrame from "@/shared/ui/MobileFrame";
import SearchBar from "@/shared/ui/SearchBar";
import Toast from "@/shared/ui/Toast";
import useToast from "@/shared/hooks/useToast";
import styles from "./BlacklistScreen.module.css";

export default function BlacklistScreen() {
  return (
    <AdminAccessGuard>
      <BlacklistContent />
    </AdminAccessGuard>
  );
}

function BlacklistContent() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const [keyword, setKeyword] = useState("");
  const [selectedParticipant, setSelectedParticipant] =
    useState<BlockedParticipant | null>(null);

  const { data, refetch } = useGroupBlacklistQuery(params.groupId);
  const { message: toastMessage, showToast } = useToast();

  const filteredParticipants = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return data.participants;

    return data.participants.filter(
      (participant) =>
        (participant.displayName && participant.displayName.toLowerCase().includes(trimmed)) ||
        (participant.name && participant.name.toLowerCase().includes(trimmed)) ||
        (participant.email && participant.email.toLowerCase().includes(trimmed)) ||
        (participant.department && participant.department.toLowerCase().includes(trimmed)) ||
        (participant.reason && participant.reason.toLowerCase().includes(trimmed)),
    );
  }, [data.participants, keyword]);

  const handleUnblockSuccess = (participantName: string) => {
    showToast(`${participantName}님의 그룹 차단이 해제되었습니다.`);
    void refetch();
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
    >
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          aria-label="이전 화면으로 이동"
          onClick={() => router.back()}
        >
          <ChevronLeft aria-hidden="true" size={24} strokeWidth={1.7} />
        </button>

        <div className={styles.titleArea}>
          <h1>그룹 차단 목록</h1>
          <p>
            {data.groupName ? `${data.groupName} · ` : ""}
            차단된 사용자 {data.participants.length}명
          </p>
        </div>
      </header>

      {/* 본문 콘텐츠 */}
      <div className={styles.content}>
        {/* 안내 박스 */}
        <section className={styles.helpBox}>
          <Ban className={styles.helpIcon} size={20} strokeWidth={2} />
          <div className={styles.helpText}>
            <strong>차단된 사용자 안내</strong>
            <p>
              차단된 참가자는 그룹에 참여할 수 없으며 조 편성에 제외됩니다.
              목록에서 참가자를 클릭하여 상세 정보 확인 및 차단을 해제할 수
              있습니다.
            </p>
          </div>
        </section>

        {/* 검색창 */}
        <SearchBar
          value={keyword}
          placeholder="이름, 소속, 차단 사유 검색"
          onChange={setKeyword}
        />

        {/* 통계 바 */}
        <div className={styles.statsBar}>
          <span>
            총 <strong>{filteredParticipants.length}</strong>명
          </span>
        </div>

        {/* 단일 차단 리스트 렌더링 (탭 제거) */}
        <section className={styles.listBox}>
          <BlockedUserList
            participants={filteredParticipants}
            onSelect={setSelectedParticipant}
          />
        </section>
      </div>

      {/* 차단된 사용자 상세 프로필 모달 */}
      <BlockedUserProfileModal
        groupId={params.groupId}
        participant={selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        onUnblockSuccess={handleUnblockSuccess}
      />

      {/* 토스트 알림 */}
      {toastMessage && (
        <Toast className={styles.toast} role="status">
          {toastMessage}
        </Toast>
      )}
    </MobileFrame>
  );
}
