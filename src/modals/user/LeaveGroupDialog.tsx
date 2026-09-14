"use client";

import { Trash2 } from "lucide-react";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";

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
    <StandardDialog
      open={open}
      titleId="leave-title"
      onClose={onClose}
      closeDisabled={isLeaving}
      icon={<Trash2 size={26} strokeWidth={1.8} />}
      title="그룹을 탈퇴할까요?"
      description={
        <>
          탈퇴하면 내 조 편성과 활동 기록이
          <br />
          모두 삭제되며 복구할 수 없습니다.
        </>
      }
      notice="이 세션은 되돌릴 수 없습니다"
      error={error}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLeaving}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLeaving}>
            {isLeaving ? "탈퇴 중..." : "탈퇴하기"}
          </Button>
        </>
      }
    />
  );
}
