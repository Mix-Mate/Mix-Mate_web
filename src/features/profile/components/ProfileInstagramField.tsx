"use client";

import styles from "@/screens/common/EditMyProfileScreen.module.css";
import {
  handleInstagramInputBlur,
  handleInstagramInputChange,
  handleInstagramInputFocus,
  handleInstagramInputKeyDown,
} from "../lib/instagram";

interface ProfileInstagramFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  placeholder?: string;
}

export default function ProfileInstagramField({
  label = "인스타 ID (선택)",
  value,
  onChange,
  onBlur,
  maxLength = 31,
  placeholder = "@아이디 입력",
}: ProfileInstagramFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        className={styles.textInput}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onFocus={() => handleInstagramInputFocus(value, onChange)}
        onBlur={() => {
          handleInstagramInputBlur(value, onChange);
          onBlur?.();
        }}
        onChange={(e) => handleInstagramInputChange(e, onChange)}
        onKeyDown={handleInstagramInputKeyDown}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
    </label>
  );
}
