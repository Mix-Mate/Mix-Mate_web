"use client";

import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import styles from "./leave-group-dialog.module.css";

interface UM01LeaveGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UM01LeaveGroupDialog({
  open,
  onClose,
  onConfirm,
}: UM01LeaveGroupDialogProps) {
  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className={styles.scrim}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={styles.bottomSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-title"
      >
        <span className={styles.sheetHandle} aria-hidden="true" />
        <span className={styles.leaveIcon}>
          <Trash2 aria-hidden="true" size={26} strokeWidth={1.8} />
        </span>
        <h2 id="leave-title">그룹을 탈퇴할까요?</h2>
        <p>
          탈퇴하면 내 조 편성과 활동 기록이
          <br />
          모두 삭제되며 복구할 수 없습니다.
        </p>
        <strong className={styles.warning}>
          이 세션은 되돌릴 수 없습니다
        </strong>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={styles.leaveButton}
            onClick={onConfirm}
          >
            탈퇴하기
          </button>
        </div>
      </section>
    </div>
  );
}
