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
  const { mutate: unblockParticipant, isPending } =
    useUnblockParticipantMutation();

  if (!participant) return null;

  const displayName = participant.displayName || participant.name || "사용자";
  const instagramText =
    participant.instagramId ?? "등록된 인스타 ID가 없습니다.";
  const emailText = participant.email || "등록된 이메일이 없습니다.";
  const bioText = participant.bio;
  const formattedDate = formatBanDate(
    participant.bannedAt || participant.blockedAt,
  );

  const handleConfirmUnblock = async () => {
    const targetUserId = participant.userId || participant.id;
    const result = await unblockParticipant(groupId, targetUserId);
    if (!result.ok) return;

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
              size={68}
            />
            <h2 id="blocked-profile-title">{displayName}</h2>
            {participant.department && <p>{participant.department}</p>}

            <div className={styles.badges}>
              <span className={styles.blockedBadge}>차단됨</span>
              {participant.role === "staff" && (
                <span className={styles.badge}>운영진</span>
              )}
            </div>
          </section>

          {/* 메타 정보 카드 (이메일 및 차단일시 포함) */}
          <section className={styles.infoCard}>
            {participant.grade && (
              <div>
                <span>학년</span>
                <strong>{participant.grade}</strong>
              </div>
            )}

            {participant.gender && (
              <div>
                <span>성별</span>
                <strong>
                  {participant.gender === "female" ? "여성" : "남성"}
                </strong>
              </div>
            )}

            {participant.department && (
              <div>
                <span>소속</span>
                <strong>{participant.department}</strong>
              </div>
            )}

            {participant.mbti && (
              <div>
                <span>MBTI</span>
                <strong>{participant.mbti}</strong>
              </div>
            )}

            {Boolean(participant.age) && (
              <div>
                <span>나이</span>
                <strong>{participant.age}세</strong>
              </div>
            )}

            {participant.instagramId && (
              <div>
                <span>인스타 ID</span>
                <strong className={styles.instagram}>{instagramText}</strong>
              </div>
            )}

            {/* 사용자 이메일 (메타 정보 블록 가장 하단) */}
            <div>
              <span>사용자 이메일</span>
              <strong className={participant.email ? styles.emailText : ""}>
                {emailText}
              </strong>
            </div>

            {/* 차단 일시 */}
            {formattedDate && (
              <div>
                <span>차단 일시</span>
                <strong>{formattedDate}</strong>
              </div>
            )}
          </section>

          {/* 차단 사유 독립 카드 */}
          <section className={styles.reasonCard}>
            <span>차단 사유</span>
            <p>{participant.reason || "등록된 차단 사유가 없습니다."}</p>
          </section>

          {/* 자기소개 (있는 경우) */}
          {bioText && (
            <section className={styles.bioCard}>
              <span>자기소개</span>
              <p>{bioText}</p>
            </section>
          )}

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
