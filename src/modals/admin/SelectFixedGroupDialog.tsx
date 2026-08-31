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
  /** 조 번호 -> 현재 그 조에 고정된 인원 수 (선택 중인 멤버 본인은 제외). */
  fixedCountByTeam: Record<number, number>;
  /** 모든 조가 기본으로 받을 수 있는 인원 수. */
  base: number;
  /** "+1명"(base+1)을 받을 수 있는 조의 개수. 어느 조가 가져갈지는 정해져 있지 않고,
   * 먼저 base+1을 채우는 조가 선점한다. */
  remainder: number;
  onClose: () => void;
  onConfirm: (teamNumber: number) => void;
}

export default function SelectFixedGroupDialog({
  open,
  member,
  currentTeamNumber,
  groupCount,
  fixedCountByTeam,
  base,
  remainder,
  onClose,
  onConfirm,
}: SelectFixedGroupDialogProps) {
  const [selected, setSelected] = useState<number | null>(
    currentTeamNumber ?? null,
  );

  if (!member) return null;

  const teamNumbers = Array.from({ length: groupCount }, (_, index) => index + 1);
  const extraSlotUsedCount = teamNumbers.filter(
    (teamNumber) => (fixedCountByTeam[teamNumber] ?? 0) >= base + 1,
  ).length;

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
        {teamNumbers.map(
          (teamNumber) => {
            const isSelected = selected === teamNumber;
            const fixedCount = fixedCountByTeam[teamNumber] ?? 0;
            const hasClaimedExtraSlot = fixedCount >= base + 1;
            const extraSlotAvailable =
              hasClaimedExtraSlot || extraSlotUsedCount < remainder;
            const capacity = extraSlotAvailable ? base + 1 : base;
            const isFull =
              capacity > 0 &&
              fixedCount >= capacity &&
              teamNumber !== currentTeamNumber;

            return (
              <button
                key={teamNumber}
                type="button"
                className={clsx(
                  styles.groupOption,
                  isSelected && styles.selected,
                  isFull && styles.disabled,
                )}
                aria-pressed={isSelected}
                disabled={isFull}
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
