"use client";

import { Link2, RefreshCw } from "lucide-react";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";
import styles from "./reissue-invitation-dialog.module.css";

interface ReissueInvitationDialogProps {
  open: boolean;
  isReissuing?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReissueInvitationDialog({
  open,
  isReissuing = false,
  error,
  onClose,
  onConfirm,
}: ReissueInvitationDialogProps) {
  return (
    <StandardDialog
      open={open}
      titleId="reissue-invitation-title"
      descriptionId="reissue-invitation-description"
      onClose={onClose}
      closeDisabled={isReissuing}
      tone="primary"
      sheetClassName={styles.sheet}
      handleClassName={styles.handle}
      icon={
        <span className={styles.iconGraphic}>
          <Link2 size={36} strokeWidth={1.8} />
          <span className={styles.refreshBadge}>
            <RefreshCw size={13} strokeWidth={2.2} />
          </span>
        </span>
      }
      title={
        <>
          참여 코드와 초대 링크를
          <br />
          새로 발급할까요?
        </>
      }
      description={
        <>
          기존 참여 코드와 초대 링크는
          <br />
          즉시 사용할 수 없게 됩니다.
          <br />새 참여 코드는 7일간 유효해요.
        </>
      }
      error={error}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isReissuing}>
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isReissuing}
            aria-busy={isReissuing}
          >
            {isReissuing ? "재발급 중..." : "재발급하기"}
          </Button>
        </>
      }
    >
      <span className={styles.divider} aria-hidden="true" />
    </StandardDialog>
  );
}
