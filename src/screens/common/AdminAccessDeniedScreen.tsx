"use client";

import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import AccessDeniedLock from "@/shared/ui/AccessDeniedLock";
import styles from "./AdminAccessDeniedScreen.module.css";

interface AdminAccessDeniedScreenProps {
  onBack: () => void;
  onGoHome: () => void;
}

export default function AdminAccessDeniedScreen({
  onBack,
  onGoHome,
}: AdminAccessDeniedScreenProps) {
  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="admin-access-denied"
    >
      <Header title="접근 불가" onBack={onBack} compact />

      <main className={styles.content} aria-labelledby="access-denied-title">
        <div className={styles.lockBackground}>
          <AccessDeniedLock className={styles.lockIcon} />
        </div>

        <div className={styles.copy}>
          <h2 id="access-denied-title">접근 권한이 없습니다</h2>
          <p>
            이 화면은 관리자 전용입니다.
            <br />
            일반 참가자는 접근할 수 없습니다.
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <Button onClick={onGoHome}>홈으로 돌아가기</Button>
      </footer>
    </MobileFrame>
  );
}
