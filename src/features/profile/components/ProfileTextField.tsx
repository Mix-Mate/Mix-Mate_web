import styles from "@/screens/common/EditMyProfileScreen.module.css";

interface ProfileTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  inputMode?: "text" | "numeric";
  maxLength?: number;
}

export default function ProfileTextField({
  label,
  value,
  onChange,
  onBlur,
  required = false,
  inputMode = "text",
  maxLength,
}: ProfileTextFieldProps) {
  return (
    <label className={styles.field}>
      <span>
        {label}
        {required && <strong> *</strong>}
      </span>
      <input
        className={styles.textInput}
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </label>
  );
}
