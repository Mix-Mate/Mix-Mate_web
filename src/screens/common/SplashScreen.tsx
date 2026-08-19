"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/shared/ui/BrandLogo";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./SplashScreen.module.css";

const HOLD_MS = 2300;

interface SplashScreenProps {
  nextHref?: string;
}

export default function SplashScreen({
  nextHref = "/login",
}: SplashScreenProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace(nextHref), HOLD_MS);
    return () => clearTimeout(timer);
  }, [nextHref, router]);

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="splash-screen"
    >
      <div className={styles.content}>
        <BrandLogo className={styles.logo} size={167} animated />
        <p className={styles.wordmark}>MixMate</p>
      </div>
    </MobileFrame>
  );
}
