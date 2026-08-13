"use client";

import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import styles from "./select-fixed-group-dialog.module.css";

interface AM09SelectFixedGroupDialogProps {
  open: boolean;
  memberName: string;
  groupCount: number;
  onClose: () => void;
  onSelect: (teamNumber: number) => void;
}

export default function AM09SelectFixedGroupDialog({
  open,
  memberName,
  groupCount,
  onClose,
  onSelect,
}: AM09SelectFixedGroupDialogProps) {
  return (
    <BottomSheetDialog
      open={open}
      titleId="select-fixed-group-title"
      descriptionId="select-fixed-group-description"
      sheetClassName={styles.sheet}
      onClose={onClose}
    >
      <h2 id="select-fixed-group-title" className={styles.title}>
        {memberName}님을 고정할 조를 선택하세요
      </h2>
      <p id="select-fixed-group-description" className={styles.description}>
        선택한 조에서만 배치되도록 고정됩니다.
      </p>

      <div className={styles.groupList}>
        {Array.from({ length: groupCount }, (_, index) => index + 1).map(
          (teamNumber) => (
            <button
              key={teamNumber}
              type="button"
              className={styles.groupButton}
              onClick={() => onSelect(teamNumber)}
            >
              {teamNumber}조
            </button>
          ),
        )}
      </div>
    </BottomSheetDialog>
  );
}
