import GenderAvatar from "@/shared/ui/GenderAvatar";
import type { MvpResultMember } from "../../types/vote.types";
import styles from "./VoteResult.module.css";

interface MvpResultTableProps {
  ranking: MvpResultMember[];
}

const placementClasses = [
  styles.winnerPlacement,
  styles.leftPlacement,
  styles.rightPlacement,
  styles.bottomPlacement,
];

export default function MvpResultTable({ ranking }: MvpResultTableProps) {
  return (
    <section className={styles.resultTable} aria-labelledby="overall-mvp-title">
      <span className={styles.resultPill} id="overall-mvp-title">
        🏆 오늘의 MVP
      </span>

      <ol className={styles.podium} aria-label="조별 MVP 결과">
        <li className={styles.centerMedallion} aria-hidden="true">
          <span>🥂</span>
        </li>
        {ranking.slice(0, 4).map((member, index) => (
          <li
            key={member.memberId}
            className={`${styles.rankEntry} ${placementClasses[index]}`}
          >
            <span className={styles.rankAvatar}>
              <GenderAvatar
                gender={member.gender}
                name={member.memberName}
                size={54}
                shape="circle"
              />
              <span className={styles.teamBadge}>{member.teamNumber}조</span>
            </span>
            <strong>{member.memberName}</strong>
            <small>
              {member.gradeLabel} · {member.mbti}
            </small>
          </li>
        ))}
      </ol>
    </section>
  );
}
