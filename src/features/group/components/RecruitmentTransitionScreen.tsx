import { Check } from "lucide-react";
import BrandLogo from "@/shared/ui/BrandLogo";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./recruitment-transition.module.css";

export type RecruitmentTransitionPhase = "closing" | "preparing";

interface RecruitmentTransitionScreenProps {
  phase?: RecruitmentTransitionPhase;
}

const transitionCopy = {
  closing: {
    badge: "모집 마감 중",
    heading: "모임 준비 중",
  },
  preparing: {
    badge: "모집 마감 완료",
    heading: "그룹 홈 준비 중",
  },
} as const;

export default function RecruitmentTransitionScreen({
  phase = "preparing",
}: RecruitmentTransitionScreenProps) {
  const copy = transitionCopy[phase];

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="recruitment-transition"
      data-phase={phase}
    >
      <section
        className={styles.content}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.halo} />
          <div className={styles.orbit} />

          <span className={`${styles.avatar} ${styles.avatarOne}`}>
            <span className={styles.avatarHead} />
            <span className={styles.avatarBody} />
          </span>
          <span className={`${styles.avatar} ${styles.avatarTwo}`}>
            <span className={styles.avatarHead} />
            <span className={styles.avatarBody} />
          </span>
          <span className={`${styles.avatar} ${styles.avatarThree}`}>
            <span className={styles.avatarHead} />
            <span className={styles.avatarBody} />
          </span>

          <div className={styles.logoCard}>
            <BrandLogo className={styles.logo} size={142} title="" />
            {phase === "preparing" && (
              <span className={styles.checkBadge}>
                <Check size={20} strokeWidth={3} />
              </span>
            )}
          </div>
        </div>

        <div className={styles.completionBadge}>
          <span aria-hidden="true">
            {phase === "preparing" ? (
              <Check size={14} strokeWidth={3} />
            ) : (
              <span className={styles.badgePulse} />
            )}
          </span>
          {copy.badge}
        </div>

        <h1>{copy.heading}</h1>

        <div className={styles.loadingDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <p className={styles.waitMessage}>잠시만 기다려 주세요</p>
    </MobileFrame>
  );
}
