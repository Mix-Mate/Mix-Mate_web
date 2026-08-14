"use client";

import { useState } from "react";
import type { ProfileMbti } from "../types/profile.types";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import fieldStyles from "@/shared/ui/FormField.module.css";
import styles from "@/screens/common/EditMyProfileScreen.module.css";

interface ProfileMbtiFieldProps {
  value: ProfileMbti;
  onChange: (value: ProfileMbti) => void;
  disabled?: boolean;
}

const mbtiOptions: ProfileMbti[] = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];

export default function ProfileMbtiField({
  value,
  onChange,
  disabled = false,
}: ProfileMbtiFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={fieldStyles.field}>
      <span className={fieldStyles.label}>MBTI</span>

      <button
        type="button"
        className={fieldStyles.selectButton}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
      >
        {value}
      </button>

      <BottomSheetDialog
        open={open}
        titleId="mbti-sheet-title"
        sheetClassName={styles.mbtiSheet}
        onClose={() => setOpen(false)}
      >
        <h2 id="mbti-sheet-title" className={styles.sheetTitle}>
          MBTI 선택
        </h2>

        <div className={styles.mbtiGrid}>
          {mbtiOptions.map((mbti) => (
            <button
              key={mbti}
              type="button"
              className={value === mbti ? styles.activeMbti : ""}
              onClick={() => {
                onChange(mbti);
                setOpen(false);
              }}
            >
              {mbti}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.sheetCloseButton}
          onClick={() => setOpen(false)}
        >
          닫기
        </button>
      </BottomSheetDialog>
    </div>
  );
}
