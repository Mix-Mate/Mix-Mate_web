"use client";

import { TriangleAlert } from "lucide-react";
import type { VoteStatusMember } from "@/features/vote/types/vote.types";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "./end-vote-dialog.module.css";

interface EndVoteDialogProps {
  open: boolean;
  pendingMembers: VoteStatusMember[];
  isEnding?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function EndVoteDialog({
  open,
  pendingMembers,
  isEnding = false,
  error,
  onClose,
  onConfirm,
}: EndVoteDialogProps) {
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
        <h3 id="pending-members-title">미투표자 {pendingMembers.length}명</h3>
        <ul className={styles.pendingList}>
          {pendingMembers.map((member) => (
            <li className={styles.pendingMember} key={member.memberId}>
              <GenderAvatar
                gender={member.gender}
                name={member.memberName}
                size={39}
                shape="circle"
              />
              <strong>{member.memberName}</strong>
              <span className={styles.absenceBadge}>불참 처리</span>
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
