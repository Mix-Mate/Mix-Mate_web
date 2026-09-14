"use client";

import { Check } from "lucide-react";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";

interface PostVoteDecisionDialogProps {
  open: boolean;
  isContinuing?: boolean;
  continueError?: string | null;
  isFinishing?: boolean;
  onContinue: () => void;
  onFinish: () => void;
}

export default function PostVoteDecisionDialog({
  open,
  isContinuing = false,
  continueError,
  isFinishing = false,
  onContinue,
  onFinish,
}: PostVoteDecisionDialogProps) {
  const isPending = isContinuing || isFinishing;

  return (
    <StandardDialog
      open={open}
      titleId="post-vote-title"
      descriptionId="post-vote-description"
      tone="success"
      icon={<Check size={27} strokeWidth={2.2} />}
      title="1차 술자리가 종료되었습니다"
      description="다음 단계를 선택해 주세요."
      error={continueError}
      actions={
        <>
          <Button variant="secondary" onClick={onContinue} disabled={isPending}>
            {isContinuing ? "진행 중..." : "계속 진행하기"}
          </Button>
          <Button variant="danger" onClick={onFinish} disabled={isPending}>
            {isFinishing ? "종료 중..." : "모임 종료하기"}
          </Button>
        </>
      }
    />
  );
}
