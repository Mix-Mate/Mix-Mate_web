"use client";

import { TriangleAlert } from "lucide-react";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";
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
    <StandardDialog
      open={open}
      titleId="assignment-warning-title"
      descriptionId="assignment-warning-description"
      onClose={onClose}
      closeDisabled={isConfirming}
      icon={<TriangleAlert size={27} strokeWidth={2.2} />}
      title={`편성 경고 ${warnings.length}건`}
      description="일부 조건을 만족하지 못했어요. 확정하거나 조건을 조정해 다시 편성할 수 있어요."
      error={error}
      actions={
        <>
          <Button variant="secondary" onClick={onReset} disabled={isConfirming}>
            재설정하기
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? "편성 중..." : "편성하기"}
          </Button>
        </>
      }
    >
      <ul className={styles.warningList}>
        {warnings.map((warning) => (
          <li key={warning} className={styles.warningItem}>
            {warning}
          </li>
        ))}
      </ul>
    </StandardDialog>
  );
}
