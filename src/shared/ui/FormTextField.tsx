import styles from "./FormField.module.css";

export interface FormTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "text" | "numeric";
  disabled?: boolean;
}

export default function FormTextField({
  label,
  value,
  onChange,
  required = false,
  inputMode = "text",
  disabled = false,
}: FormTextFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {label}
        {required && <strong className={styles.requiredMark}> *</strong>}
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
