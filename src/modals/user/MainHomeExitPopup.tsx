"use client";

import { House } from "lucide-react";
import { useEffect, useRef } from "react";
import styles from "./main-home-exit-popup.module.css";

interface MainHomeExitPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant?: "default" | "first-round-complete";
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export default function MainHomeExitPopup({
  open,
  onClose,
  onConfirm,
  variant = "default",
  title = "메인 홈으로 나가시겠습니까?",
  description = "그룹에서 나가지 않고 메인 홈으로 이동합니다.",
  confirmLabel = "나가기",
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

  if (variant === "first-round-complete") {
    return (
      <div
        className={`${styles.overlay} ${styles.celebrationOverlay}`}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <section
          className={`${styles.popup} ${styles.celebrationPopup}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-round-complete-title"
          aria-describedby="first-round-complete-message first-round-complete-description"
        >
          <header className={styles.celebrationBanner}>
            <div className={styles.confetti} aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <span
                  key={index}
                  className={`${styles.confettiPiece} ${styles[`confetti${index + 1}`]}`}
                />
              ))}
            </div>

            <span className={styles.partyBadge} aria-hidden="true">
              <svg
                viewBox="0 0 48 48"
                width="32"
                height="32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 38.5 18 17l15 15-22.5 6.5Z"
                  fill="#FACC15"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="m13.7 29.4 5.9 5.9" stroke="#EC4899" strokeWidth="3" />
                <path d="m16.2 22.4 10.3 10.3" stroke="#22C55E" strokeWidth="3" />
                <path
                  d="M23 13c1.2-3.7 4-5.4 7.8-5.1M29 18c4.5-1.3 7.7-.3 9.6 3M32.4 25.3c3.7-.1 6.1 1.5 7.2 4.8"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="36.5" cy="10.5" r="2.3" fill="#F9A8D4" />
                <path d="m18 8 1.2 4.2 4.2 1.2-4.2 1.2L18 19l-1.2-4.4-4.2-1.2 4.2-1.2L18 8Z" fill="#A7F3D0" />
                <path d="m38.5 16.5 3-3" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>

            <span className={styles.celebrationLabel}>1차 완료</span>
            <h2 id="first-round-complete-title">
              1차 술자리를 완료했습니다! <span aria-hidden="true">🎉</span>
            </h2>
          </header>

          <div className={styles.celebrationBody}>
            <p
              id="first-round-complete-message"
              className={styles.celebrationMessage}
            >
              함께해서 더 즐거운 시간이었어요. <br/>조심히 돌아가세요!
            </p>
            <p
              id="first-round-complete-description"
              className={styles.celebrationNotice}
            >
              2차 불참자로 메인 홈으로 이동합니다.
            </p>

            <div className={`${styles.actions} ${styles.celebrationActions}`}>
              <button
                ref={cancelButtonRef}
                type="button"
                className={`${styles.cancelButton} ${styles.celebrationCancelButton}`}
                onClick={onClose}
              >
                취소
              </button>
              <button
                type="button"
                className={`${styles.confirmButton} ${styles.celebrationConfirmButton}`}
                onClick={onConfirm}
              >
                홈으로 이동하기
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

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

        <h2 id="main-home-exit-title">{title}</h2>
        <p id="main-home-exit-description">{description}</p>

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
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
