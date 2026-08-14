import clsx from "clsx";
import styles from "./FormField.module.css";

export interface ChipFieldOption<TValue extends string> {
  label: string;
  value: TValue;
}

export interface ChipFieldProps<TValue extends string> {
  label: string;
  value: TValue;
  options: ChipFieldOption<TValue>[];
  onChange: (value: TValue) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function ChipField<TValue extends string>({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
}: ChipFieldProps<TValue>) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        {label}
        {required && <strong className={styles.requiredMark}> *</strong>}
      </span>

      <div
        className={clsx(styles.chipGroup, disabled && styles.disabledChipGroup)}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={value === option.value ? styles.activeChip : ""}
            disabled={disabled}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
