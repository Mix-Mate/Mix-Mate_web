import { Check, Sparkles } from "lucide-react";
import BrandLogo from "@/shared/ui/BrandLogo";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./recruitment-transition.module.css";

export type RecruitmentTransitionPhase = "closing" | "preparing";

interface RecruitmentTransitionScreenProps {
  groupName: string;
  phase?: RecruitmentTransitionPhase;
}

const transitionCopy = {
  closing: {
    badge: "모집 마감 중",
    heading: "모두가 함께할 준비를\n하고 있어요",
    description: "참가자 정보를 안전하게 정리하고 있어요.",
  },
  preparing: {
    badge: "모집 마감 완료",
    heading: "그룹 홈을 준비하고\n있어요",
    description: "새로운 만남을 시작할 공간을 열고 있어요.",
  },
} as const;

export default function RecruitmentTransitionScreen({
  groupName,
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
      <div className={styles.ambientTop} aria-hidden="true" />
      <div className={styles.ambientBottom} aria-hidden="true" />

      <header className={styles.brand} aria-label="MixMate">
        <span className={styles.brandMark} aria-hidden="true">
          <BrandLogo size={36} title="" />
        </span>
        <span>MixMate</span>
      </header>

      <section
        className={styles.content}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className={styles.illustration} aria-hidden="true">
          <span className={styles.sparkleLeft}>
            <Sparkles size={24} strokeWidth={1.7} />
          </span>
          <span className={styles.sparkleRight}>
            <Sparkles size={18} strokeWidth={1.9} />
          </span>

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

        <p className={styles.groupName}>{groupName}</p>
        <h1>{copy.heading}</h1>
        <p className={styles.description}>{copy.description}</p>

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
