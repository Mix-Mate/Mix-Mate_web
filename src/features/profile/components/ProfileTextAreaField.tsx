import styles from "@/screens/common/EditMyProfileScreen.module.css";

interface ProfileTextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  onBlur?: () => void;
  error?: string;
}

export default function ProfileTextAreaField({
  label,
  value,
  onChange,
  maxLength,
  onBlur,
  error,
}: ProfileTextAreaFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <textarea
        className={styles.textArea}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
      />
      {error && (
        <small className={styles.fieldError} role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
