"use client";

import { useEffect } from "react";
import styles from "./VoteStatus.module.css";

interface VoteCompletionWatcherProps {
  isComplete: boolean;
  onComplete?: () => void;
}

export default function VoteCompletionWatcher({
  isComplete,
  onComplete,
}: VoteCompletionWatcherProps) {
  useEffect(() => {
    if (isComplete) {
      onComplete?.();
    }
  }, [isComplete, onComplete]);

  return (
    <span className={styles.visuallyHidden} aria-live="polite">
      {isComplete ? "모든 참가자의 투표가 완료되었습니다." : ""}
    </span>
  );
}
