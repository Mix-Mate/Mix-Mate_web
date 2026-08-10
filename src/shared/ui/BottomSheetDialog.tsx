"use client";

import clsx from "clsx";
import { useEffect, type ReactNode } from "react";
import styles from "./BottomSheetDialog.module.css";

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
  useEffect(() => {
    if (!open || !onClose) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeDisabled, onClose, open]);

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
        className={clsx(styles.sheet, sheetClassName)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
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
