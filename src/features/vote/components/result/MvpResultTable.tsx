import type { ProfileGrade } from "@/features/profile/types/profile.types";
import type { MvpWinner } from "../../types/voteResult.types";
import styles from "./VoteResult.module.css";

interface MvpResultTableProps {
  winners: MvpWinner[];
}

const gradeLabelByGrade: Record<ProfileGrade, string> = {
  FIRST: "1학년",
  SECOND: "2학년",
  THIRD: "3학년",
  FOURTH: "4학년",
};

export default function MvpResultTable({ winners }: MvpResultTableProps) {
  return (
    <section className={styles.resultTable} aria-labelledby="overall-mvp-title">
      <span className={styles.resultPill} id="overall-mvp-title">
        🏆 오늘의 MVP
      </span>

      {winners.length > 0 ? (
        <ol
          className={`${styles.mvpWinnerList} ${
            winners.length === 1 ? styles.singleMvpWinnerList : ""
          }`}
          aria-label="오늘의 MVP 결과"
        >
          {winners.map((winner) => (
            <li className={styles.mvpWinnerCard} key={winner.participantId}>
              <span className={styles.rankAvatar}>
                <span className={styles.initialAvatar} aria-hidden="true">
                  {winner.displayName.slice(0, 1)}
                </span>
                <span className={styles.teamBadge}>{winner.teamNumber}조</span>
              </span>
              <strong>{winner.displayName}</strong>
              <small>
                {gradeLabelByGrade[winner.grade]} · {winner.mbti}
              </small>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.emptyMvpResult}>선정된 MVP가 없습니다.</p>
      )}
    </section>
  );
}
