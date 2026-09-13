"use client";

import { CircleAlert, LockKeyhole } from "lucide-react";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";

interface CloseRecruitmentDialogProps {
  open: boolean;
  isClosing?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CloseRecruitmentDialog({
  open,
  isClosing = false,
  error,
  onClose,
  onConfirm,
}: CloseRecruitmentDialogProps) {
  return (
    <StandardDialog
      open={open}
      titleId="close-recruitment-title"
      descriptionId="close-recruitment-description"
      onClose={onClose}
      closeDisabled={isClosing}
      icon={<LockKeyhole size={27} strokeWidth={1.8} />}
      title={
        <>
          참가자 모집을
          <br />
          마감하시겠습니까?
        </>
      }
      description={
        <>
          모집을 마감하면 초대코드를 통한
          <br />
          추가 참여가 불가능합니다.
        </>
      }
      notice={
        <>
          <CircleAlert size={18} strokeWidth={1.8} />이 작업은 되돌릴 수
          없습니다.
        </>
      }
      error={error}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isClosing}>
            취소
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isClosing}
            aria-busy={isClosing}
          >
            {isClosing ? "마감 중..." : "모집 마감"}
          </Button>
        </>
      }
    />
  );
}
