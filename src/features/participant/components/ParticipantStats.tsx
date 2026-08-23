import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantStatsProps {
  count: number;
  label?: string;
}

export default function ParticipantStats({
  count,
  label = "전체 참가자",
}: ParticipantStatsProps) {
  return (
    <div className={styles.listHeader}>
      <strong>{label}</strong>
      <span>{count}명</span>
    </div>
  );
}
