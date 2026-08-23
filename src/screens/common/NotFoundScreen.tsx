"use client";

import { useRouter } from "next/navigation";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import NotFoundIllustration from "@/shared/ui/NotFoundIllustration";
import styles from "./NotFoundScreen.module.css";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      fillHeight
      data-testid="not-found-screen"
    >
      <Header title="Not Found" onBack={() => router.back()} compact />

      <main className={styles.content}>
        <NotFoundIllustration className={styles.illustration} />

        <div className={styles.copy}>
          <p className={styles.code}>404</p>
          <h2>페이지를 찾을 수 없습니다</h2>
          <p className={styles.description}>
            요청하신 주소가 존재하지 않거나
            <br />
            변경되었을 수 있습니다.
          </p>
        </div>
      </main>

      <footer className={styles.footer}>
        <Button onClick={() => router.replace("/")}>홈으로 돌아가기</Button>
      </footer>
    </MobileFrame>
  );
}
