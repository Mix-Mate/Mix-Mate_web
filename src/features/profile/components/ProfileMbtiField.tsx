"use client";

import { useState } from "react";
import type { ProfileMbti } from "../types/profile.types";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import styles from "@/screens/common/EditMyProfileScreen.module.css";

interface ProfileMbtiFieldProps {
  value: ProfileMbti | null;
  onChange: (value: ProfileMbti) => void;
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
}: ProfileMbtiFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.field}>
      <span>MBTI</span>

      <button
        type="button"
        className={styles.selectField}
        onClick={() => setOpen(true)}
      >
        {value ?? "선택"}
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
