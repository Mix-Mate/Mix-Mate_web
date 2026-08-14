import styles from "@/screens/common/EditMyProfileScreen.module.css";

interface ProfileChipOption<TValue extends string> {
  label: string;
  value: TValue;
}

interface ProfileChipFieldProps<TValue extends string> {
  label: string;
  value: TValue;
  options: ProfileChipOption<TValue>[];
  onChange: (value: TValue) => void;
  required?: boolean;
}

export default function ProfileChipField<TValue extends string>({
  label,
  value,
  options,
  onChange,
  required = false,
}: ProfileChipFieldProps<TValue>) {
  return (
    <div className={styles.field}>
      <span>
        {label}
        {required && <strong> *</strong>}
      </span>

      <div className={styles.chipGroup}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? styles.activeChip : ""}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
