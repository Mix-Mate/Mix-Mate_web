"use client";

import { CircleAlert } from "lucide-react";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";

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
    <StandardDialog
      open={open}
      titleId="confirm-assignment-title"
      descriptionId="confirm-assignment-description"
      onClose={onClose}
      closeDisabled={isConfirming}
      tone="primary"
      icon={<CircleAlert size={27} strokeWidth={1.8} />}
      title="조 편성을 확정하시겠어요?"
      description="조 편성을 확정하면 현재 결과로 모임이 진행되며, 이후에는 이전 단계로 돌아갈 수 없습니다."
      error={error}
      actions={
        <>
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
        </>
      }
    />
  );
}
