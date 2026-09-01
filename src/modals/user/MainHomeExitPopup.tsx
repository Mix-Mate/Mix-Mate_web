"use client";

import { House } from "lucide-react";
import { useEffect, useRef } from "react";
import styles from "./main-home-exit-popup.module.css";

interface MainHomeExitPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MainHomeExitPopup({
  open,
  onClose,
  onConfirm,
}: MainHomeExitPopupProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    cancelButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={styles.popup}
        role="dialog"
        aria-modal="true"
        aria-labelledby="main-home-exit-title"
        aria-describedby="main-home-exit-description"
      >
        <span className={styles.homeIcon} aria-hidden="true">
          <House size={24} strokeWidth={1.8} />
        </span>

        <h2 id="main-home-exit-title">메인 홈으로 나가시겠습니까?</h2>
        <p id="main-home-exit-description">
          그룹에서 나가지 않고 메인 홈으로 이동합니다.
        </p>

        <div className={styles.actions}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            나가기
          </button>
        </div>
      </section>
    </div>
  );
}
