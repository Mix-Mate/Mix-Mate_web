"use client";

import { Check, CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  correctSecondRoundVoteByHost,
  voteSecondRoundByHost,
} from "@/features/vote/api/adminSecondRoundVote.api";
import type { SecondRoundVoteChoice } from "@/features/vote/types/secondRoundVote.types";
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

interface RowState {
  isSubmitting: boolean;
  error: string | null;
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
  const [openMemberId, setOpenMemberId] = useState<number | null>(null);
  const [rowStates, setRowStates] = useState<Record<number, RowState>>({});

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

  const handleSelectChoice = async (
    member: SecondRoundVoteParticipant,
    choice: SecondRoundVoteChoice,
  ) => {
    setOpenMemberId(null);
    setRowStates((prev) => ({
      ...prev,
      [member.participantId]: { isSubmitting: true, error: null },
    }));

    try {
      if (member.choice === null) {
        await voteSecondRoundByHost(groupId, member.participantId, choice);
      } else {
        await correctSecondRoundVoteByHost(
          groupId,
          member.participantId,
          choice,
        );
      }
      setRowStates((prev) => ({
        ...prev,
        [member.participantId]: { isSubmitting: false, error: null },
      }));
      onVoteChange();
    } catch (submitError) {
      setRowStates((prev) => ({
        ...prev,
        [member.participantId]: {
          isSubmitting: false,
          error:
            submitError instanceof Error
              ? submitError.message
              : "처리에 실패했습니다.",
        },
      }));
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
          {pendingMembers.map((member) => {
            const rowState = rowStates[member.participantId];
            const isMenuOpen = openMemberId === member.participantId;

            return (
              <li className={styles.pendingMember} key={member.participantId}>
                <strong>{member.displayName}</strong>

                {member.manualEntry ? (
                  <div className={styles.voteDropdown}>
                    <button
                      type="button"
                      className={`${styles.voteDropdownTrigger} ${
                        isMenuOpen ? styles.voteDropdownTriggerActive : ""
                      }`}
                      disabled={rowState?.isSubmitting}
                      onClick={() =>
                        setOpenMemberId(isMenuOpen ? null : member.participantId)
                      }
                      aria-expanded={isMenuOpen}
                      aria-label={`${member.displayName} 수동 투표`}
                    >
                      {member.choice === "PARTICIPATE" && (
                        <CircleCheck
                          className={styles.attendanceIcon}
                          size={16}
                          strokeWidth={2}
                        />
                      )}
                      {member.choice === "NOT_PARTICIPATE" && (
                        <CircleX
                          className={styles.absenceIcon}
                          size={16}
                          strokeWidth={2}
                        />
                      )}
                      {member.choice === null && <span>수동 투표</span>}
                      <span
                        className={`${styles.voteDropdownArrow} ${
                          isMenuOpen ? styles.voteDropdownArrowOpen : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {isMenuOpen && (
                      <>
                        <button
                          type="button"
                          className={styles.voteDropdownBackdrop}
                          aria-hidden="true"
                          tabIndex={-1}
                          onClick={() => setOpenMemberId(null)}
                        />
                        <div className={styles.voteDropdownMenu} role="menu">
                          <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={member.choice === "PARTICIPATE"}
                            className={`${styles.voteDropdownItem} ${
                              member.choice === "PARTICIPATE"
                                ? styles.voteDropdownItemActive
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectChoice(member, "PARTICIPATE")
                            }
                          >
                            <CircleCheck
                              className={styles.attendanceIcon}
                              size={16}
                              strokeWidth={2}
                            />
                            참가
                            {member.choice === "PARTICIPATE" && (
                              <Check
                                className={styles.voteDropdownCheck}
                                size={14}
                                strokeWidth={2.5}
                              />
                            )}
                          </button>
                          <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={member.choice === "NOT_PARTICIPATE"}
                            className={`${styles.voteDropdownItem} ${
                              member.choice === "NOT_PARTICIPATE"
                                ? styles.voteDropdownItemActive
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectChoice(member, "NOT_PARTICIPATE")
                            }
                          >
                            <CircleX
                              className={styles.absenceIcon}
                              size={16}
                              strokeWidth={2}
                            />
                            불참
                            {member.choice === "NOT_PARTICIPATE" && (
                              <Check
                                className={styles.voteDropdownCheck}
                                size={14}
                                strokeWidth={2.5}
                              />
                            )}
                          </button>
                        </div>
                      </>
                    )}

                    {rowState?.error && (
                      <span className={styles.rowError} role="alert">
                        {rowState.error}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className={styles.waitingBadge}>대기 중</span>
                )}
              </li>
            );
          })}
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
