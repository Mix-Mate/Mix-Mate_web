"use client";

import { TriangleAlert } from "lucide-react";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import styles from "./assignment-warning-dialog.module.css";

interface AssignmentWarningDialogProps {
  open: boolean;
  warnings: string[];
  isConfirming?: boolean;
  error?: string | null;
  onClose: () => void;
  onReset: () => void;
  onConfirm: () => void;
}

export default function AssignmentWarningDialog({
  open,
  warnings,
  isConfirming = false,
  error,
  onClose,
  onReset,
  onConfirm,
}: AssignmentWarningDialogProps) {
  return (
    <BottomSheetDialog
      open={open}
      titleId="assignment-warning-title"
      descriptionId="assignment-warning-description"
      sheetClassName={styles.bottomSheet}
      onClose={onClose}
      closeDisabled={isConfirming}
    >
      <span className={styles.warningIcon} aria-hidden="true">
        <TriangleAlert size={32} strokeWidth={2.2} />
      </span>

      <div className={styles.message}>
        <h2 id="assignment-warning-title">편성 경고 {warnings.length}건</h2>
        <p id="assignment-warning-description">
          일부 조건을 만족하지 못했어요. 확정하거나 조건을 조정해 다시 편성할
          수 있어요.
        </p>
      </div>

      <ul className={styles.warningList}>
        {warnings.map((warning) => (
          <li key={warning} className={styles.warningItem}>
            {warning}
          </li>
        ))}
      </ul>

      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}

      <div className={styles.actions}>
        <Button
          variant="secondary"
          className={styles.resetButton}
          onClick={onReset}
          disabled={isConfirming}
        >
          재설정하기
        </Button>
        <Button
          variant="danger"
          className={styles.confirmButton}
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? "편성 중..." : "편성하기"}
        </Button>
      </div>
    </BottomSheetDialog>
  );
}
