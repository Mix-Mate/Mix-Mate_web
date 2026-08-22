"use client";

import { CircleAlert, LockKeyhole } from "lucide-react";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import styles from "./close-recruitment-dialog.module.css";

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
    <BottomSheetDialog
      open={open}
      titleId="close-recruitment-title"
      descriptionId="close-recruitment-description"
      sheetClassName={styles.bottomSheet}
      onClose={onClose}
      closeDisabled={isClosing}
    >
      <span className={styles.lockIcon} aria-hidden="true">
        <LockKeyhole size={32} strokeWidth={1.8} />
      </span>

      <h2 id="close-recruitment-title">참가자 모집을 마감하시겠습니까?</h2>
      <p id="close-recruitment-description">
        모집을 마감하면 초대코드를 통한
        <br />
        추가 참여가 불가능합니다.
      </p>

      <strong className={styles.warning}>
        <CircleAlert aria-hidden="true" size={18} strokeWidth={1.8} />이 작업은
        되돌릴 수 없습니다.
      </strong>

      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}

      <div className={styles.divider} />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={isClosing}>
          취소
        </Button>
        <Button
          variant="danger"
          className={styles.confirmButton}
          onClick={onConfirm}
          disabled={isClosing}
          aria-busy={isClosing}
        >
          {isClosing ? "마감 중..." : "모집 마감"}
        </Button>
      </div>
    </BottomSheetDialog>
  );
}
