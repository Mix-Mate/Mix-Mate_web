"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { BlockedParticipant } from "../types/blacklist.types";
import { useUnblockParticipantMutation } from "../hooks/useUnblockParticipantMutation";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "./BlockedUserProfileModal.module.css";

interface BlockedUserProfileModalProps {
  groupId: string;
  participant: BlockedParticipant | null;
  onClose: () => void;
  onUnblockSuccess: (participantName: string) => void;
}

function formatBanDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  } catch {
    return dateStr;
  }
}

export default function BlockedUserProfileModal({
  groupId,
  participant,
  onClose,
  onUnblockSuccess,
}: BlockedUserProfileModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unblockError, setUnblockError] = useState("");
  const { mutate: unblockParticipant, isPending } =
    useUnblockParticipantMutation();

  if (!participant) return null;

  const displayName = participant.displayName || participant.name || "사용자";
  const emailText = participant.email || "등록된 이메일이 없습니다.";
  const formattedDate = formatBanDate(
    participant.bannedAt || participant.blockedAt,
  );

  const handleConfirmUnblock = async () => {
    setUnblockError("");
    const targetUserId = participant.userId || participant.id;
    const result = await unblockParticipant(groupId, targetUserId);
    if (!result.ok) {
      setUnblockError(result.message);
      return;
    }

    setConfirmOpen(false);
    onClose();
    onUnblockSuccess(displayName);
  };

  return (
    <>
      <BottomSheetDialog
        open={Boolean(participant)}
        titleId="blocked-profile-title"
        sheetClassName={styles.sheet}
        onClose={onClose}
      >
        <div className={styles.content}>
          <section className={styles.profileHeader}>
            <GenderAvatar
              gender={participant.gender || "male"}
              name={displayName}
              size={52}
            />
            <h2 id="blocked-profile-title">{displayName}</h2>

            <div className={styles.badges}>
              <span className={styles.blockedBadge}>차단됨</span>
            </div>
          </section>

          {/* 메타 정보 카드 (이메일 및 차단일시) */}
          <section className={styles.infoCard}>
            <div>
              <span>이메일</span>
              <strong className={participant.email ? styles.emailText : ""}>
                {emailText}
              </strong>
            </div>

            <div>
              <span>차단 일시</span>
              <strong>{formattedDate || "-"}</strong>
            </div>
          </section>

          {/* 차단 사유 카드 */}
          <section className={styles.reasonCard}>
            <span>차단 사유</span>
            <p>{participant.reason || "등록된 차단 사유가 없습니다."}</p>
          </section>

          {/* 액션 버튼 */}
          <div className={styles.actions}>
            <Button
              className={styles.unblockButton}
              onClick={() => setConfirmOpen(true)}
            >
              그룹 차단 해제
            </Button>
            <Button
              variant="secondary"
              className={styles.closeButton}
              onClick={onClose}
            >
              닫기
            </Button>
          </div>
        </div>
      </BottomSheetDialog>

      {/* 차단 해제 확인 모달 */}
      <BottomSheetDialog
        open={confirmOpen}
        titleId="unblock-confirm-title"
        descriptionId="unblock-confirm-description"
        sheetClassName={styles.confirmDialogSheet}
        onClose={() => setConfirmOpen(false)}
        closeDisabled={isPending}
      >
        <div className={styles.confirmContent}>
          <span className={styles.warningIcon} aria-hidden="true">
            <CheckCircle2 size={24} strokeWidth={2} />
          </span>

          <h2 id="unblock-confirm-title">그룹 차단을 해제하시겠습니까?</h2>
          <p id="unblock-confirm-description">
            {displayName}님의 그룹 차단을 해제합니다.
            <br />
            차단이 해제되면 참가자가 다시 그룹 활동에 참여할 수 있습니다.
          </p>

          {unblockError && (
            <p className={styles.unblockError} role="alert">
              {unblockError}
            </p>
          )}

          <div className={styles.confirmActions}>
            <Button
              variant="secondary"
              disabled={isPending}
              onClick={() => setConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="primary"
              disabled={isPending}
              onClick={handleConfirmUnblock}
            >
              {isPending ? "해제 중..." : "해제하기"}
            </Button>
          </div>
        </div>
      </BottomSheetDialog>
    </>
  );
}
