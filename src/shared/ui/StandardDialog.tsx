"use client";

import type { ReactNode } from "react";
import BottomSheetDialog from "./BottomSheetDialog";
import styles from "./StandardDialog.module.css";

type StandardDialogTone = "danger" | "primary" | "success";
type StandardDialogPresentation = "bottom-sheet" | "popup";

interface StandardDialogProps {
  open: boolean;
  titleId: string;
  descriptionId?: string;
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  notice?: ReactNode;
  error?: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
  tone?: StandardDialogTone;
  presentation?: StandardDialogPresentation;
  scrimClassName?: string;
  sheetClassName?: string;
  handleClassName?: string;
  onClose?: () => void;
  closeDisabled?: boolean;
}

export default function StandardDialog({
  open,
  titleId,
  descriptionId,
  icon,
  title,
  description,
  notice,
  error,
  children,
  actions,
  tone = "danger",
  presentation = "bottom-sheet",
  scrimClassName,
  sheetClassName,
  handleClassName,
  onClose,
  closeDisabled = false,
}: StandardDialogProps) {
  return (
    <BottomSheetDialog
      open={open}
      titleId={titleId}
      descriptionId={descriptionId}
      presentation={presentation}
      scrimClassName={scrimClassName}
      sheetClassName={`${styles.sheet} ${
        presentation === "popup" ? styles.popup : ""
      } ${sheetClassName ?? ""}`.trim()}
      handleClassName={handleClassName}
      onClose={onClose}
      closeDisabled={closeDisabled}
    >
      <span className={`${styles.icon} ${styles[tone]}`} aria-hidden="true">
        {icon}
      </span>

      <div className={styles.message}>
        <h2 id={titleId}>{title}</h2>
        {description && <p id={descriptionId}>{description}</p>}
        {notice && (
          <strong className={`${styles.notice} ${styles[tone]}`}>
            {notice}
          </strong>
        )}
        {error && (
          <span className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>

      {children}

      <div className={styles.actions}>{actions}</div>
    </BottomSheetDialog>
  );
}
