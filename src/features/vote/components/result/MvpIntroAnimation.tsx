"use client";

import { useEffect, useState } from "react";
import type { MvpWinner } from "../../types/voteResult.types";
import styles from "./VoteResult.module.css";

interface MvpIntroAnimationProps {
  winners: MvpWinner[];
  onComplete: () => void;
}

export default function MvpIntroAnimation({
  winners,
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
      <span className={styles.resultPill}>🏆 오늘의 MVP</span>

      <div className={styles.mvpHalo}>
        <span className={styles.confetti} aria-hidden="true">
          🤡🎉
        </span>
        {winners.length > 0 ? (
          <span
            className={`${styles.mvpWinnerNames} ${
              winners.length > 1 ? styles.multipleMvpWinnerNames : ""
            }`}
            aria-label={`오늘의 MVP ${winners
              .map((winner) => winner.displayName)
              .join(", ")}`}
          >
            {winners.map((winner) => (
              <strong key={winner.participantId}>{winner.displayName}</strong>
            ))}
          </span>
        ) : (
          <strong className={styles.emptyMvp}>선정 결과 없음</strong>
        )}
      </div>

      <p className={styles.introCaption}>
        1차 술자리에서
        <br />
        <span>분위기를 가장 잘 이끈 </span>
        <strong>분위기 메이커!</strong>
      </p>

      <p
        className={styles.transitionNotice}
        aria-live="polite"
        aria-atomic="true"
      >
        <strong key={countdown}>{countdown}초</strong> 뒤에 자동으로 다음 화면으로
        넘어갑니다
      </p>
    </section>
  );
}
