"use client";

import { Trash2 } from "lucide-react";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import styles from "./leave-group-dialog.module.css";

interface UM01LeaveGroupDialogProps {
  open: boolean;
  isLeaving?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UM01LeaveGroupDialog({
  open,
  isLeaving = false,
  error,
  onClose,
  onConfirm,
}: UM01LeaveGroupDialogProps) {
  return (
    <BottomSheetDialog
      open={open}
      titleId="leave-title"
      sheetClassName={styles.bottomSheet}
      onClose={onClose}
      closeDisabled={isLeaving}
    >
      <span className={styles.leaveIcon}>
        <Trash2 aria-hidden="true" size={26} strokeWidth={1.8} />
      </span>
      <h2 id="leave-title">그룹을 탈퇴할까요?</h2>
      <p>
        탈퇴하면 내 조 편성과 활동 기록이
        <br />
        모두 삭제되며 복구할 수 없습니다.
      </p>
      <strong className={styles.warning}>이 세션은 되돌릴 수 없습니다</strong>
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={isLeaving}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.leaveButton}
          onClick={onConfirm}
          disabled={isLeaving}
        >
          {isLeaving ? "탈퇴 중..." : "탈퇴하기"}
        </button>
      </div>
    </BottomSheetDialog>
  );
}
