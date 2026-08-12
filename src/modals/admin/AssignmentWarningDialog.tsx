"use client";

import { CircleAlert } from "lucide-react";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import type { AssignmentWarning } from "@/features/assignment/types/assignment.types";

interface AM04AssignmentWarningDialogProps {
  open: boolean;
  warnings: AssignmentWarning[];
  onClose: () => void;
  onConfirm: () => void;
}

export default function AM04AssignmentWarningDialog({
  open,
  warnings,
  onClose,
  onConfirm,
}: AM04AssignmentWarningDialogProps) {
  return (
    <BottomSheetDialog
      open={open}
      titleId="assignment-warning-title"
      sheetClassName=""
      onClose={onClose}
    >
      <h2 id="assignment-warning-title">
        <CircleAlert aria-hidden="true" size={20} strokeWidth={1.8} />
        조건을 완벽히 충족할 수 없어요
      </h2>
      <ul>
        {warnings.map((warning) => (
          <li key={warning.code}>{warning.message}</li>
        ))}
      </ul>
      <div>
        <Button type="button" variant="secondary" onClick={onClose}>
          다시 설정하기
        </Button>
        <Button type="button" onClick={onConfirm}>
          그대로 진행하기
        </Button>
      </div>
    </BottomSheetDialog>
  );
}
