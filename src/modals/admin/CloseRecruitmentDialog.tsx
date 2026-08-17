"use client";

import { CircleAlert, LockKeyhole } from "lucide-react";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import styles from "./close-recruitment-dialog.module.css";

interface CloseRecruitmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CloseRecruitmentDialog({
  open,
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
    >
      <span className={styles.lockIcon} aria-hidden="true">
        <LockKeyhole size={32} strokeWidth={1.8} />
      </span>

      <h2 id="close-recruitment-title">모집을 마감할까요?</h2>
      <p id="close-recruitment-description">
        모집을 마감하면 사용자는 더이상
        <br />
        프로필을 수정할 수 없습니다.
      </p>

      <strong className={styles.warning}>
        <CircleAlert aria-hidden="true" size={18} strokeWidth={1.8} />
        마감 후에는 되돌릴 수 없습니다.
      </strong>

      <div className={styles.divider} />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button
          variant="danger"
          className={styles.confirmButton}
          onClick={onConfirm}
        >
          마감하기
        </Button>
      </div>
    </BottomSheetDialog>
  );
}
