"use client";

import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./BottomSheetDialog.module.css";

const FOCUSABLE_ELEMENT_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface BottomSheetDialogProps {
  open: boolean;
  titleId: string;
  descriptionId?: string;
  children: ReactNode;
  scrimClassName?: string;
  sheetClassName: string;
  handleClassName?: string;
  onClose?: () => void;
  closeDisabled?: boolean;
}

export default function BottomSheetDialog({
  open,
  titleId,
  descriptionId,
  children,
  scrimClassName,
  sheetClassName,
  handleClassName,
  onClose,
  closeDisabled = false,
}: BottomSheetDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open || !onClose) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeDisabled, onClose, open]);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const scrim = dialog.parentElement;
    const backgroundElements = scrim?.parentElement
      ? Array.from(scrim.parentElement.children).filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement && element !== scrim,
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
    (getFocusableElements()[0] ?? dialog).focus({ preventScroll: true });

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

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={clsx(styles.scrim, scrimClassName)}
      role="presentation"
      onMouseDown={(event) => {
        if (onClose && !closeDisabled && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className={clsx(styles.sheet, sheetClassName)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <span
          className={clsx(styles.handle, handleClassName)}
          aria-hidden="true"
        />
        {children}
      </section>
    </div>
  );
}
