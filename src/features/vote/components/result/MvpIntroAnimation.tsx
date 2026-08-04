"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 4000);
    return () => window.clearTimeout(timer);
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
    </section>
  );
}
