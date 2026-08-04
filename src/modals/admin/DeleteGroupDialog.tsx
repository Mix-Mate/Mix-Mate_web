"use client";

import { CircleAlert, Trash2 } from "lucide-react";
import { useEffect } from "react";
import styles from "./delete-group-dialog.module.css";

interface AM02DeleteGroupDialogProps {
  open: boolean;
  isDeleting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AM02DeleteGroupDialog({
  open,
  isDeleting = false,
  error,
  onClose,
  onConfirm,
}: AM02DeleteGroupDialogProps) {
  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isDeleting, onClose, open]);

  if (!open) return null;

  return (
    <div
      className={styles.scrim}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onClose();
      }}
    >
      <section
        className={styles.bottomSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-group-title"
        aria-describedby="delete-group-description"
      >
        <span className={styles.sheetHandle} aria-hidden="true" />

        <span className={styles.deleteIcon} aria-hidden="true">
          <Trash2 size={26} strokeWidth={1.8} />
        </span>

        <div className={styles.message}>
          <h2 id="delete-group-title">그룹을 삭제할까요?</h2>
          <p id="delete-group-description">
            삭제하면 전체 참여자 명단이
            <br />
            모두 삭제되며 복구할 수 없습니다.
          </p>
          <strong className={styles.warning}>
            <CircleAlert aria-hidden="true" size={18} strokeWidth={1.8} />이
            세션은 되돌릴 수 없습니다
          </strong>
          {error && (
            <span className={styles.error} role="alert">
              {error}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isDeleting}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제하기"}
          </button>
        </div>
      </section>
    </div>
  );
}
