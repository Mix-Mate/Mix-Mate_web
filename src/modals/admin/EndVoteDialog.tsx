"use client";

import { TriangleAlert } from "lucide-react";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import AdminManualVoteControl from "@/features/vote/components/status/AdminManualVoteControl";
import type { SecondRoundVoteParticipant } from "@/features/vote/types/secondRoundVoteStatus.types";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import styles from "./end-vote-dialog.module.css";

interface EndVoteDialogProps {
  open: boolean;
  groupId: string;
  pendingMembers: SecondRoundVoteParticipant[];
  isEnding?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  onVoteChange: () => void;
}

interface PendingListDragState {
  pointerId: number;
  startY: number;
  startScrollTop: number;
}

export default function EndVoteDialog({
  open,
  groupId,
  pendingMembers,
  isEnding = false,
  error,
  onClose,
  onConfirm,
  onVoteChange,
}: EndVoteDialogProps) {
  const pendingListRef = useRef<HTMLUListElement>(null);
  const pendingListDragRef = useRef<PendingListDragState | null>(null);

  const startPendingListDrag = (
    event: ReactPointerEvent<HTMLUListElement>,
  ) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    pendingListDragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startScrollTop: event.currentTarget.scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePendingListDrag = (
    event: ReactPointerEvent<HTMLUListElement>,
  ) => {
    const dragState = pendingListDragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.currentTarget.scrollTop =
      dragState.startScrollTop + dragState.startY - event.clientY;
  };

  const finishPendingListDrag = (
    event: ReactPointerEvent<HTMLUListElement>,
  ) => {
    if (pendingListDragRef.current?.pointerId !== event.pointerId) return;

    pendingListDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <BottomSheetDialog
      open={open}
      titleId="end-vote-title"
      descriptionId="end-vote-description"
      scrimClassName={styles.scrim}
      sheetClassName={styles.bottomSheet}
      handleClassName={styles.sheetHandle}
      onClose={onClose}
      closeDisabled={isEnding}
    >
      <span className={styles.endIcon} aria-hidden="true">
        <TriangleAlert size={32} strokeWidth={2.2} />
      </span>

      <div className={styles.message}>
        <h2 id="end-vote-title">미투표자가 있습니다</h2>
        <p id="end-vote-description">
          종료하면 미투표자는 <strong>자동 불참 처리</strong>됩니다
        </p>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <section
        className={styles.pendingSection}
        aria-labelledby="pending-members-title"
      >
        <h3 id="pending-members-title">미투표 명단</h3>
        <ul
          ref={pendingListRef}
          className={styles.pendingList}
          aria-label="미투표자 명단"
          tabIndex={0}
          onPointerDown={startPendingListDrag}
          onPointerMove={movePendingListDrag}
          onPointerUp={finishPendingListDrag}
          onPointerCancel={finishPendingListDrag}
          onLostPointerCapture={() => {
            pendingListDragRef.current = null;
          }}
        >
          {pendingMembers.map((member) => (
            <li className={styles.pendingMember} key={member.participantId}>
              <strong>{member.displayName}</strong>

              {member.manualEntry ? (
                <AdminManualVoteControl
                  groupId={groupId}
                  member={member}
                  onVoteChange={onVoteChange}
                />
              ) : (
                <span className={styles.waitingBadge}>대기 중</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}

      <div className={styles.actions}>
        <Button
          variant="secondary"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={isEnding}
        >
          취소
        </Button>
        <Button
          variant="danger"
          className={styles.endButton}
          onClick={onConfirm}
          disabled={isEnding}
        >
          {isEnding ? "종료 중..." : "지금 종료하기"}
        </Button>
      </div>
    </BottomSheetDialog>
  );
}
