import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantStatsProps {
  count: number;
}

export default function ParticipantStats({ count }: ParticipantStatsProps) {
  return (
    <div className={styles.listHeader}>
      <strong>전체 참가자</strong>
      <span>{count}명</span>
    </div>
  );
}
