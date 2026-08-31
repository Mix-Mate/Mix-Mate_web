import styles from "@/screens/common/EditMyProfileScreen.module.css";

interface ProfileTextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export default function ProfileTextAreaField({
  label,
  value,
  onChange,
  maxLength,
}: ProfileTextAreaFieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <textarea
        className={styles.textArea}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
