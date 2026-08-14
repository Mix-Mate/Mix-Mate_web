import styles from "./FormField.module.css";

export interface FormTextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function FormTextAreaField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: FormTextAreaFieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {label}
        {required && <strong className={styles.requiredMark}> *</strong>}
      </span>
      <textarea
        className={styles.textArea}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
