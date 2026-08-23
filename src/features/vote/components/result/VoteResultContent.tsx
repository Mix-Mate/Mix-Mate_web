"use client";

import { useCallback, useState } from "react";
import { House } from "lucide-react";
import Button from "@/shared/ui/Button";
import type { VoteResultResponse } from "../../types/voteResult.types";
import AttendanceResultSummary from "./AttendanceResultSummary";
import MvpIntroAnimation from "./MvpIntroAnimation";
import MvpResultTable from "./MvpResultTable";
import styles from "./VoteResult.module.css";

interface VoteResultContentProps {
  result: VoteResultResponse;
  onHome: () => void;
}

export default function VoteResultContent({
  result,
  onHome,
}: VoteResultContentProps) {
  const [showOverallResult, setShowOverallResult] = useState(false);
  const revealOverallResult = useCallback(() => {
    setShowOverallResult(true);
  }, []);

  return (
    <section className={styles.resultScreen}>
      <div className={styles.resultBody}>
        <article
          className={`${styles.resultCard} ${
            showOverallResult ? styles.overallResultCard : ""
          }`}
        >
          {showOverallResult ? (
            <MvpResultTable winners={result.mvpWinners} />
          ) : (
            <MvpIntroAnimation
              winners={result.mvpWinners}
              onComplete={revealOverallResult}
            />
          )}
        </article>

        <div className={styles.resultDivider} aria-hidden="true">
          <span>다음 단계</span>
        </div>

        <AttendanceResultSummary
          participants={result.secondRoundParticipants}
        />
      </div>

      <footer className={styles.resultFooter}>
        <Button className={styles.homeButton} onClick={onHome}>
          <House aria-hidden="true" size={18} strokeWidth={1.8} />
          홈으로 돌아가기
        </Button>
      </footer>
    </section>
  );
}
