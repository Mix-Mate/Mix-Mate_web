import type { ParticipantRole } from "../types/participant.types";
import styles from "@/screens/common/ParticipantListScreen.module.css";

export type ParticipantFilterValue = "all" | ParticipantRole;

const filters: { label: string; value: ParticipantFilterValue }[] = [
  { label: "전체", value: "all" },
  { label: "일반", value: "general" },
  { label: "운영진", value: "staff" },
];

interface ParticipantFilterProps {
  value: ParticipantFilterValue;
  onChange: (value: ParticipantFilterValue) => void;
}

export default function ParticipantFilter({
  value,
  onChange,
}: ParticipantFilterProps) {
  return (
    <div className={styles.filters}>
      {filters.map((item) => (
        <button
          key={item.value}
          type="button"
          className={value === item.value ? styles.activeFilter : ""}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
