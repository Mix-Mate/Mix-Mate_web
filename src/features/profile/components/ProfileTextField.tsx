import styles from "@/screens/common/EditMyProfileScreen.module.css";

interface ProfileTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "text" | "numeric";
  disabled?: boolean;
}

export default function ProfileTextField({
  label,
  value,
  onChange,
  required = false,
  inputMode = "text",
  disabled = false,
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
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
