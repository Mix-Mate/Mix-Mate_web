"use client";

import { CircleAlert } from "lucide-react";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import styles from "./confirm-assignment-dialog.module.css";

interface ConfirmAssignmentDialogProps {
  open: boolean;
  isConfirming?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmAssignmentDialog({
  open,
  isConfirming = false,
  error,
  onClose,
  onConfirm,
}: ConfirmAssignmentDialogProps) {
  return (
    <BottomSheetDialog
      open={open}
      titleId="confirm-assignment-title"
      descriptionId="confirm-assignment-description"
      sheetClassName={styles.bottomSheet}
      onClose={onClose}
      closeDisabled={isConfirming}
    >
      <span className={styles.warningIcon} aria-hidden="true">
        <CircleAlert size={32} strokeWidth={1.8} />
      </span>

      <h2 id="confirm-assignment-title">조 편성을 확정하시겠어요?</h2>
      <p id="confirm-assignment-description">
        조 편성을 확정하면 현재 결과로 모임이 진행되며, 이후에는 이전 단계로
        돌아갈 수 없습니다.
      </p>

      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}

      <div className={styles.divider} />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={isConfirming}>
          취소
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isConfirming}
          aria-busy={isConfirming}
        >
          {isConfirming ? "확정 중..." : "확정하기"}
        </Button>
      </div>
    </BottomSheetDialog>
  );
}
