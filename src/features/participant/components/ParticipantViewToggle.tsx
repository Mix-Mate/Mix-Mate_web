import type { ParticipantViewMode } from "../types/participant.types";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantViewToggleProps {
  value: ParticipantViewMode;
  onChange: (value: ParticipantViewMode) => void;
}

const viewOptions: { label: string; value: ParticipantViewMode }[] = [
  { label: "전체", value: "all" },
  { label: "조별", value: "team" },
];

export default function ParticipantViewToggle({
  value,
  onChange,
}: ParticipantViewToggleProps) {
  return (
    <div className={styles.viewToggle} aria-label="참가자 보기 방식">
      {viewOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? styles.activeViewToggle : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}