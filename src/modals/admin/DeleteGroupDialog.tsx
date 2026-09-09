"use client";

import { CircleAlert, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import Button from "@/shared/ui/Button";
import styles from "./delete-group-dialog.module.css";

const FOCUSABLE_ELEMENT_SELECTOR = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const overlay = dialog.parentElement;
    const backgroundElements = overlay?.parentElement
      ? Array.from(overlay.parentElement.children).filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement && element !== overlay,
        )
      : [];
    const elementsAlreadyInert = new Set(
      backgroundElements.filter((element) => element.hasAttribute("inert")),
    );
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const getFocusableElements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR),
      ).filter(
        (element) =>
          !element.hidden && element.getAttribute("aria-hidden") !== "true",
      );

    backgroundElements.forEach((element) => element.setAttribute("inert", ""));
    cancelButtonRef.current?.focus({ preventScroll: true });

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || !dialog.contains(activeElement)) {
          event.preventDefault();
          lastElement.focus({ preventScroll: true });
        }
        return;
      }

      if (activeElement === lastElement || !dialog.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      document.removeEventListener("keydown", trapFocus);
      backgroundElements.forEach((element) => {
        if (!elementsAlreadyInert.has(element))
          element.removeAttribute("inert");
      });
      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus({ preventScroll: true });
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isDeleting, onClose, open]);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-group-title"
        aria-describedby="delete-group-description"
        aria-busy={isDeleting}
        tabIndex={-1}
      >
        <div className={styles.iconArea} aria-hidden="true">
          <span className={styles.deleteIcon}>
            <Trash2 size={34} strokeWidth={1.7} />
          </span>
        </div>

        <div className={styles.message}>
          <h2 id="delete-group-title">그룹을 삭제할까요?</h2>
          <p id="delete-group-description">
            삭제하면 전체 참여자 명단이
            <br />
            모두 삭제되며 복구할 수 없습니다.
          </p>
          <strong className={styles.warning}>
            <CircleAlert aria-hidden="true" size={18} strokeWidth={2} />이
            세션은 되돌릴 수 없습니다
          </strong>
          {error && (
            <span className={styles.error} role="alert">
              {error}
            </span>
          )}
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.actions}>
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="danger"
            className={styles.deleteButton}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제하기"}
          </Button>
        </div>
      </section>
    </div>
  );
}
