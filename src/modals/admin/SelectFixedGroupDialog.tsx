"use client";

import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";

interface AM09SelectFixedGroupDialogProps {
  open: boolean;
  groupCount: number;
  memberName: string;
  onClose: () => void;
  onSelect: (teamNumber: number) => void;
}

export default function AM09SelectFixedGroupDialog({
  open,
  groupCount,
  memberName,
  onClose,
  onSelect,
}: AM09SelectFixedGroupDialogProps) {
  return (
    <BottomSheetDialog
      open={open}
      titleId="select-fixed-group-title"
      sheetClassName=""
      onClose={onClose}
    >
      <h2 id="select-fixed-group-title">{memberName}님을 고정할 조 선택</h2>
      <ul>
        {Array.from({ length: groupCount }, (_, index) => index + 1).map(
          (teamNumber) => (
            <li key={teamNumber}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onSelect(teamNumber)}
              >
                {teamNumber}조
              </Button>
            </li>
          ),
        )}
      </ul>
    </BottomSheetDialog>
  );
}
