"use client";

import { CircleAlert, Power } from "lucide-react";
import type { GroupRound } from "@/features/session/types/session.types";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";

interface EndRoundDialogProps {
  open: boolean;
  round: GroupRound;
  isEnding?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function EndRoundDialog({
  open,
  round,
  isEnding = false,
  error,
  onClose,
  onConfirm,
}: EndRoundDialogProps) {
  return (
    <StandardDialog
      open={open}
      titleId="end-round-title"
      descriptionId="end-round-description"
      onClose={onClose}
      closeDisabled={isEnding}
      icon={<Power size={27} strokeWidth={1.9} />}
      title={`${round}차 술자리를 종료할까요?`}
      description={
        round === 1 ? (
          <>
            현재 진행 중인 술자리를 마감하고
            <br />
            다음 단계로 이동합니다.
          </>
        ) : (
          <>
            현재 진행 중인 2차 술자리를 마감하고
            <br />
            모임을 최종 종료합니다.
          </>
        )
      }
      notice={
        <>
          <CircleAlert aria-hidden="true" size={18} strokeWidth={1.8} />
          종료 후에는 이전 상태로 되돌릴 수 없습니다.
        </>
      }
      error={error}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isEnding}>
            취소
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isEnding}>
            {isEnding ? "종료 중..." : "종료하기"}
          </Button>
        </>
      }
    />
  );
}
