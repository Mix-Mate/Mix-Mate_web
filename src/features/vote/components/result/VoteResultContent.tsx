"use client";

import { useMemo } from "react";
import { ChevronRight, House, UsersRound } from "lucide-react";
import Button from "@/shared/ui/Button";
import { SECOND_ROUND_MIN_PARTICIPANTS } from "../../lib/second-round";
import type {
  MvpWinner,
  VoteResultResponse,
} from "../../types/voteResult.types";
import AttendanceResultSummary from "./AttendanceResultSummary";
import MvpIntroAnimation from "./MvpIntroAnimation";
import MvpResultTable from "./MvpResultTable";
import styles from "./VoteResult.module.css";

interface VoteResultContentProps {
  result: VoteResultResponse;
  introMvpWinner: MvpWinner | null;
  showOverallResult: boolean;
  onRevealOverallResult: () => void;
  onHome: () => void;
  onOpenMvpList: () => void;
  onOpenSecondRoundParticipantList: () => void;
}

const MVP_PREVIEW_LIMIT = 4;

function selectRandomMvpWinners(result: VoteResultResponse) {
  if (result.mvpWinners.length <= MVP_PREVIEW_LIMIT) {
    return result.mvpWinners;
  }

  const shuffledWinners = [...result.mvpWinners];

  for (let index = shuffledWinners.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledWinners[index], shuffledWinners[randomIndex]] = [
      shuffledWinners[randomIndex],
      shuffledWinners[index],
    ];
  }

  return shuffledWinners.slice(0, MVP_PREVIEW_LIMIT);
}

export default function VoteResultContent({
  result,
  introMvpWinner,
  showOverallResult,
  onRevealOverallResult,
  onHome,
  onOpenMvpList,
  onOpenSecondRoundParticipantList,
}: VoteResultContentProps) {
  const displayedMvpWinners = useMemo(
    () => selectRandomMvpWinners(result),
    [result],
  );
  const shouldShowSecondRoundParticipantList =
    showOverallResult &&
    result.secondRoundParticipants.length >= SECOND_ROUND_MIN_PARTICIPANTS;

  return (
    <section className={styles.resultScreen}>
      <div className={styles.resultBody}>
        <AttendanceResultSummary />

        <article
          className={`${styles.resultCard} ${
            showOverallResult ? styles.overallResultCard : ""
          }`}
        >
          {showOverallResult ? (
            <MvpResultTable
              winners={displayedMvpWinners}
              onOpenList={onOpenMvpList}
            />
          ) : (
            <MvpIntroAnimation
              winner={introMvpWinner}
              onComplete={onRevealOverallResult}
            />
          )}
        </article>

        {shouldShowSecondRoundParticipantList && (
          <button
            type="button"
            className={styles.participantListButton}
            aria-label="2차 참가자 목록"
            onClick={onOpenSecondRoundParticipantList}
          >
            <span className={styles.participantListIcon} aria-hidden="true">
              <UsersRound size={20} strokeWidth={1.7} />
            </span>
            <span>2차 참가자 목록</span>
            <ChevronRight
              className={styles.participantListChevron}
              aria-hidden="true"
              size={20}
              strokeWidth={1.7}
            />
          </button>
        )}
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
