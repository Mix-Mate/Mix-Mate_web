"use client";

import { Check } from "lucide-react";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import styles from "./post-vote-decision-dialog.module.css";

interface PostVoteDecisionDialogProps {
  open: boolean;
  onContinue: () => void;
  onFinish: () => void;
}

export default function PostVoteDecisionDialog({
  open,
  onContinue,
  onFinish,
}: PostVoteDecisionDialogProps) {
  return (
    <BottomSheetDialog
      open={open}
      titleId="post-vote-title"
      descriptionId="post-vote-description"
      scrimClassName={styles.scrim}
      sheetClassName={styles.bottomSheet}
      handleClassName={styles.sheetHandle}
    >
      <div className={styles.content}>
        <span className={styles.completeIcon} aria-hidden="true">
          <Check size={50} strokeWidth={2.2} />
        </span>
        <h2 id="post-vote-title">1차 술자리가 종료되었습니다</h2>
        <p id="post-vote-description">다음 단계를 선택해 주세요.</p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.continueButton}
          onClick={onContinue}
        >
          계속 진행하기
        </button>
        <button
          type="button"
          className={styles.finishButton}
          onClick={onFinish}
        >
          모임 종료하기
        </button>
      </div>
    </BottomSheetDialog>
  );
}
