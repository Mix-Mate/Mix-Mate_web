"use client";

import { useEffect, useState } from "react";
import type { MvpResultMember } from "../../types/vote.types";
import styles from "./VoteResult.module.css";

interface MvpIntroAnimationProps {
  teamMvp: MvpResultMember;
  onComplete: () => void;
}

export default function MvpIntroAnimation({
  teamMvp,
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
        <strong>{teamMvp.memberName}</strong>
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
