"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { useState } from "react";
import { toGender } from "@/features/assignment/model/assignment.mapper";
import type { ParticipantCandidate } from "@/features/assignment/types/assignment.types";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "./select-fixed-group-dialog.module.css";

interface SelectFixedGroupDialogProps {
  open: boolean;
  member: ParticipantCandidate | null;
  currentTeamNumber: number | null;
  groupCount: number;
  onClose: () => void;
  onConfirm: (teamNumber: number) => void;
}

export default function SelectFixedGroupDialog({
  open,
  member,
  currentTeamNumber,
  groupCount,
  onClose,
  onConfirm,
}: SelectFixedGroupDialogProps) {
  const [selected, setSelected] = useState<number | null>(
    currentTeamNumber ?? null,
  );

  if (!member) return null;

  return (
    <BottomSheetDialog
      open={open}
      titleId="select-fixed-group-title"
      sheetClassName={styles.sheet}
      onClose={onClose}
    >
      <div className={styles.header}>
        <GenderAvatar
          gender={toGender(member.gender)}
          name={member.displayName}
          size={46}
        />
        <div className={styles.info}>
          <h2 id="select-fixed-group-title" className={styles.name}>
            {member.displayName}
          </h2>
          <p className={styles.meta}>{member.major}</p>
        </div>
        <span className={styles.headerLabel}>고정할 조 선택</span>
      </div>

      <div className={styles.groupList}>
        {Array.from({ length: groupCount }, (_, index) => index + 1).map(
          (teamNumber) => {
            const isSelected = selected === teamNumber;

            return (
              <button
                key={teamNumber}
                type="button"
                className={clsx(
                  styles.groupOption,
                  isSelected && styles.selected,
                )}
                aria-pressed={isSelected}
                onClick={() => setSelected(teamNumber)}
              >
                {teamNumber}조
                {isSelected && (
                  <span className={styles.check} aria-hidden="true">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          },
        )}
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" type="button" onClick={onClose}>
          취소
        </Button>
        <Button
          type="button"
          disabled={selected === null}
          onClick={() => {
            if (selected !== null) onConfirm(selected);
          }}
        >
          {selected !== null ? `${selected}조로 고정` : "조를 선택해주세요"}
        </Button>
      </div>
    </BottomSheetDialog>
  );
}
