import { CircleCheck } from "lucide-react";
import styles from "./VoteResult.module.css";

export default function AttendanceResultSummary() {
  return (
    <aside
      className={styles.resultSummary}
      aria-labelledby="attendance-result-title"
    >
      <CircleCheck aria-hidden="true" size={16} strokeWidth={1.8} />
      <strong id="attendance-result-title">1차 술자리가 종료 되었습니다!</strong>
    </aside>
  );
}
