import type { SecondRoundVoteStatusFilter } from "../../types/secondRoundVoteStatus.types";
import styles from "./VoteStatus.module.css";

interface VoteProgressCardProps {
  totalCount: number;
  completedCount: number;
  attendanceCount: number;
  absenceCount: number;
  pendingCount: number;
  selectedFilter: SecondRoundVoteStatusFilter;
  onSelectFilter: (filter: SecondRoundVoteStatusFilter) => void;
}

export default function VoteProgressCard({
  totalCount,
  completedCount,
  attendanceCount,
  absenceCount,
  pendingCount,
  selectedFilter,
  onSelectFilter,
}: VoteProgressCardProps) {
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <section
      className={styles.progressSection}
      aria-labelledby="vote-progress-title"
    >
      <div className={styles.progressCard}>
        <h2 id="vote-progress-title">투표 완료</h2>

        <p className={styles.progressCount}>
          <strong>{completedCount}</strong>
          <span>/ {totalCount}명</span>
        </p>

        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="전체 투표 진행률"
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-valuenow={completedCount}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <button
          type="button"
          className={`${styles.summaryButton} ${styles.attendanceSummary} ${
            selectedFilter === "PARTICIPATE"
              ? styles.selectedAttendanceSummary
              : ""
          }`}
          aria-label={`2차 참여 ${attendanceCount}명 명단 보기`}
          aria-pressed={selectedFilter === "PARTICIPATE"}
          onClick={() => onSelectFilter("PARTICIPATE")}
        >
          <strong>{attendanceCount}</strong>
          <span>2차 참여</span>
        </button>
        <button
          type="button"
          className={`${styles.summaryButton} ${styles.absenceSummary} ${
            selectedFilter === "NOT_PARTICIPATE"
              ? styles.selectedAbsenceSummary
              : ""
          }`}
          aria-label={`불참 ${absenceCount}명 명단 보기`}
          aria-pressed={selectedFilter === "NOT_PARTICIPATE"}
          onClick={() => onSelectFilter("NOT_PARTICIPATE")}
        >
          <strong>{absenceCount}</strong>
          <span>불참</span>
        </button>
        <button
          type="button"
          className={`${styles.summaryButton} ${styles.pendingSummary} ${
            selectedFilter === "PENDING" ? styles.selectedPendingSummary : ""
          }`}
          aria-label={`미투표 ${pendingCount}명 명단 보기`}
          aria-pressed={selectedFilter === "PENDING"}
          onClick={() => onSelectFilter("PENDING")}
        >
          <strong>{pendingCount}</strong>
          <span>미투표</span>
        </button>
      </div>
    </section>
  );
}
