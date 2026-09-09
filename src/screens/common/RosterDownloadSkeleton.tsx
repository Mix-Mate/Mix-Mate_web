"use client";

import { useRouter } from "next/navigation";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./RosterDownloadScreen.module.css";

export function RosterDownloadCardSkeleton() {
  return (
    <div
      className={`${styles.downloadItem} ${styles.skeletonItem}`}
      data-testid="roster-card-skeleton"
      aria-hidden="true"
    >
      <span className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} />
      <span className={styles.skeletonFileInfo}>
        <span className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
        <span
          className={`${styles.skeletonBlock} ${styles.skeletonSubtitle}`}
        />
      </span>
      <span className={`${styles.skeletonBlock} ${styles.skeletonButton}`} />
    </div>
  );
}

export default function RosterDownloadSkeleton() {
  const router = useRouter();

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="roster-download-skeleton"
    >
      <Header title="명단 다운로드" onBack={() => router.back()} />

      <main className={styles.content} aria-busy="true">
        <p className={styles.srOnly} role="status">
          명단 다운로드 화면을 불러오는 중입니다.
        </p>

        <section className={styles.skeletonIntro} aria-hidden="true">
          <span className={`${styles.skeletonBlock} ${styles.skeletonGroup}`} />
          <span className={`${styles.skeletonBlock} ${styles.skeletonMeta}`} />
        </section>

        <div className={styles.skeletonBanner} aria-hidden="true">
          <span className={`${styles.skeletonBlock} ${styles.skeletonIcon}`} />
          <span className={styles.skeletonBannerCopy}>
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonBannerLine}`}
            />
            <span
              className={`${styles.skeletonBlock} ${styles.skeletonBannerLineShort}`}
            />
          </span>
        </div>

        <SkeletonSection />
        <SkeletonSection />
      </main>
    </MobileFrame>
  );
}

function SkeletonSection() {
  return (
    <section className={styles.downloadSection} aria-hidden="true">
      <span
        className={`${styles.skeletonBlock} ${styles.skeletonSectionHeading}`}
      />
      <div className={styles.downloadList}>
        <RosterDownloadCardSkeleton />
        <RosterDownloadCardSkeleton />
      </div>
    </section>
  );
}
