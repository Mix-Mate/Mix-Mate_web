"use client";

import { CircleAlert, TriangleAlert } from "lucide-react";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import styles from "./end-vote-dialog.module.css";

interface EndVoteDialogProps {
  open: boolean;
  isEnding?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function EndVoteDialog({
  open,
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
        <TriangleAlert size={34} strokeWidth={1.9} />
      </span>

      <div className={styles.message}>
        <h2 id="end-vote-title">투표를 강제 종료 할까요?</h2>
        <p id="end-vote-description">
          종료하면 미투표자가
          <br />
          모두 2차 불참자로 처리됩니다.
        </p>
        <strong className={styles.warning}>
          <CircleAlert aria-hidden="true" size={20} strokeWidth={1.8} />이
          종료는 되돌릴 수 없습니다
        </strong>
        {error && (
          <span className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={isEnding}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.endButton}
          onClick={onConfirm}
          disabled={isEnding}
        >
          {isEnding ? "종료 중..." : "지금 종료하기"}
        </button>
      </div>
    </BottomSheetDialog>
  );
}
