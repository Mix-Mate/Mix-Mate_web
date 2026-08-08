"use client";

import { CircleAlert, Power } from "lucide-react";
import { useEffect } from "react";
import type { GroupRound } from "@/features/session/types/session.types";
import styles from "./end-round-dialog.module.css";

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
  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isEnding) onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isEnding, onClose, open]);

  if (!open) return null;

  return (
    <div
      className={styles.scrim}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isEnding) onClose();
      }}
    >
      <section
        className={styles.bottomSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-round-title"
        aria-describedby="end-round-description"
      >
        <span className={styles.sheetHandle} aria-hidden="true" />

        <span className={styles.endIcon} aria-hidden="true">
          <Power size={27} strokeWidth={1.9} />
        </span>

        <div className={styles.message}>
          <h2 id="end-round-title">{round}차 술자리를 종료할까요?</h2>
          <p id="end-round-description">
            {round === 1 ? (
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
            )}
          </p>
          <strong className={styles.warning}>
            <CircleAlert aria-hidden="true" size={18} strokeWidth={1.8} />
            종료 후에는 이전 상태로 되돌릴 수 없습니다.
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
            disabled={isEnding}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.endButton}
            onClick={onConfirm}
            disabled={isEnding}
          >
            {isEnding ? "종료 중..." : "종료하기"}
          </button>
        </div>
      </section>
    </div>
  );
}
