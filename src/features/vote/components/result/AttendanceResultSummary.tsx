import { CircleCheck } from "lucide-react";
import styles from "./VoteResult.module.css";

export default function AttendanceResultSummary() {
  return (
    <aside
      className={styles.resultSummary}
      aria-labelledby="attendance-result-title"
    >
      <CircleCheck aria-hidden="true" size={16} strokeWidth={1.8} />
      <p>
        <strong id="attendance-result-title">참여자 명단 확정</strong>
        <span>
          2차 참여자 명단이 확정되었습니다. 관리자가 2차 자리 배치를 시작할 수
          있습니다.
        </span>
      </p>
    </aside>
  );
}
