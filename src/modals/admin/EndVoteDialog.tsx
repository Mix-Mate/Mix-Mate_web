"use client";

import { TriangleAlert } from "lucide-react";
import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
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
  // 대신 투표 요청이 서버에 닿기 전에 투표가 종료되면 그 지정이 유실되므로,
  // 제출 중인 행이 하나라도 있으면 종료 버튼을 잠근다.
  const [submittingIds, setSubmittingIds] = useState<number[]>([]);
  const [manualVoteError, setManualVoteError] = useState<string | null>(null);

  const handleSubmittingChange = useCallback(
    (participantId: number, isSubmitting: boolean) => {
      setSubmittingIds((current) =>
        isSubmitting
          ? current.includes(participantId)
            ? current
            : [...current, participantId]
          : current.filter((id) => id !== participantId),
      );
    },
    [],
  );

  const isSubmittingManualVote = submittingIds.length > 0;

  const startPendingListDrag = (
    event: ReactPointerEvent<HTMLUListElement>,
  ) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    // 버튼 위에서 시작한 드래그까지 포인터를 가로채면 클릭이 버튼에 닿지 않는다.
    if (
      event.target instanceof Element &&
      event.target.closest("button, a, input, select, textarea")
    ) {
      return;
    }

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
        {pendingMembers.length > 0 ? (
          <>
            <h2 id="end-vote-title">미투표자가 있습니다</h2>
            <p id="end-vote-description">
              종료하면 미투표자는 <strong>자동 불참 처리</strong>됩니다
              <br />
              <span className={styles.descriptionNote}>
                ※ 아래 명단에서 참가 여부를 대신 지정할 수 있어요.
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 id="end-vote-title">모든 참가자가 투표를 완료했습니다</h2>
            <p id="end-vote-description">
              지금 투표를 종료하고 결과를 확인하시겠어요?
            </p>
          </>
        )}
      </div>

      {pendingMembers.length > 0 && (
        <>
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
                <li
                  className={styles.pendingMember}
                  key={member.participantId}
                >
                  <strong>{member.displayName}</strong>

                  {/* 종료 직전이라 본인 투표를 더 기다릴 수 없으므로, 계정 유무와
                      관계없이 미투표자는 관리자가 대신 지정할 수 있게 한다. */}
                  <AdminManualVoteControl
                    groupId={groupId}
                    member={member}
                    onVoteChange={onVoteChange}
                    onSubmittingChange={handleSubmittingChange}
                    onError={setManualVoteError}
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {(error || manualVoteError) && (
        <span className={styles.error} role="alert">
          {error ?? manualVoteError}
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
          disabled={isEnding || isSubmittingManualVote}
        >
          {isEnding ? "종료 중..." : "지금 종료하기"}
        </Button>
      </div>
    </BottomSheetDialog>
  );
}
