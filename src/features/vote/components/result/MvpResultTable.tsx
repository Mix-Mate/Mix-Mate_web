import Image from "next/image";
import { Martini } from "lucide-react";
import type { ProfileGrade } from "@/features/profile/types/profile.types";
import type { MvpWinner } from "../../types/voteResult.types";
import styles from "./VoteResult.module.css";

interface MvpResultTableProps {
  winners: MvpWinner[];
  onOpenList: () => void;
}

const placementClasses = [
  styles.winnerPlacement,
  styles.leftPlacement,
  styles.rightPlacement,
  styles.bottomPlacement,
];

const clinkGlassClasses = [
  styles.clinkGlassTop,
  styles.clinkGlassLeft,
  styles.clinkGlassRight,
  styles.clinkGlassBottom,
];

const sparkleParticles = ["✦", "·", "✧", "✦", "·", "✧", "✦", "·", "✧", "✦"];

const gradeLabelByGrade: Record<ProfileGrade, string> = {
  FIRST: "1학년",
  SECOND: "2학년",
  THIRD: "3학년",
  FOURTH: "4학년",
  OTHER: "기타",
};

export default function MvpResultTable({
  winners,
  onOpenList,
}: MvpResultTableProps) {
  const displayedWinners = winners.slice(0, 4);

  return (
    <section className={styles.resultTable} aria-labelledby="overall-mvp-title">
      <button
        type="button"
        className={styles.resultPill}
        id="overall-mvp-title"
        aria-label="오늘의 MVP 전체 목록 보기"
        onClick={onOpenList}
      >
        <span>🏆 오늘의 MVP</span>
        <small className={styles.resultPillHint}>목록보기 클릭</small>
      </button>

      {displayedWinners.length > 0 ? (
        <ol className={styles.podium} aria-label="오늘의 MVP 결과">
          <li className={styles.centerMedallion} aria-hidden="true">
            <Image
              className={styles.centerLogo}
              src="/icons/logo.png"
              alt=""
              width={37}
              height={37}
            />
            <Image
              className={styles.centerTable}
              src="/images/vote/mvp-table.png"
              alt=""
              width={45}
              height={35}
            />
          </li>
          <li className={styles.clinkImpact} aria-hidden="true">
            <span className={styles.impactRing} />
            <span className={styles.impactRays}>
              {Array.from({ length: 4 }, (_, index) => (
                <span key={index} className={styles.impactRay} />
              ))}
            </span>
            <span className={styles.sparkleParticles}>
              {sparkleParticles.map((particle, index) => (
                <span key={index} className={styles.sparkleParticle}>
                  {particle}
                </span>
              ))}
            </span>
          </li>
          {displayedWinners.map((winner, index) => (
            <li
              key={winner.participantId}
              className={`${styles.rankEntry} ${placementClasses[index]}`}
            >
              <span className={styles.mvpIllustration} aria-hidden="true">
                <Image
                  className={styles.armsUp}
                  src="/images/vote/mvp-arms-up.png"
                  alt=""
                  width={69}
                  height={54}
                />
                <Martini
                  className={`${styles.martiniGlass} ${styles.clinkGlass} ${clinkGlassClasses[index]}`}
                  aria-hidden="true"
                  size={30}
                  strokeWidth={1.8}
                />
                <span className={styles.teamBadge}>{winner.teamNumber}조</span>
              </span>
              <strong title={winner.displayName}>{winner.displayName}</strong>
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
