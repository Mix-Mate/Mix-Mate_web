"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MvpWinner } from "../../types/voteResult.types";
import styles from "./VoteResult.module.css";

interface MvpIntroAnimationProps {
  winner: MvpWinner | null;
  onComplete: () => void;
}

export default function MvpIntroAnimation({
  winner,
  onComplete,
}: MvpIntroAnimationProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const countdownTimer = window.setInterval(() => {
      setCountdown((current) => Math.max(1, current - 1));
    }, 1000);
    const completeTimer = window.setTimeout(onComplete, 5000);

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <section className={styles.introStage} aria-live="polite">
      <span className={styles.resultPill}>오늘의 우리 조 MVP</span>

      <Image
        className={styles.mvpTrophy}
        src="/images/vote/mvp-trophy.png"
        alt=""
        width={106}
        height={71}
      />

      <div className={styles.mvpHalo}>
        <span className={styles.confetti} aria-hidden="true">
          🤡🎉
        </span>
        {winner ? (
          <span
            className={styles.mvpWinnerNames}
            aria-label={`우리 조 MVP ${winner.displayName}`}
          >
            <strong>{winner.displayName}</strong>
          </span>
        ) : (
          <strong className={styles.emptyMvp}>선정 결과 없음</strong>
        )}
      </div>

      <div className={styles.introCaption}>
        <p>1차 술자리에서</p>
        <p>
          <span>분위기를 가장 잘 이끈 </span>
          <strong>분위기 메이커!</strong>
        </p>
        <p
          className={styles.transitionNotice}
          aria-live="polite"
          aria-atomic="true"
        >
          <strong key={countdown}>{countdown}초</strong> 뒤에 화면이 전환됩니다.
        </p>
      </div>
    </section>
  );
}
