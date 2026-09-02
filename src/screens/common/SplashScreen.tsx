"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, isTokenExpired } from "@/shared/api/authToken";
import BrandLogo from "@/shared/ui/BrandLogo";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./SplashScreen.module.css";

const HOLD_MS = 2800;

interface SplashScreenProps {
  nextHref?: string;
}

export default function SplashScreen({
  nextHref,
}: SplashScreenProps) {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const hasValidToken = !!token && !isTokenExpired(token);
    const target = nextHref || (hasValidToken ? "/home" : "/login");
    const timer = setTimeout(() => router.replace(target), HOLD_MS);
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
        <p className={styles.tagline}>모임의 시작부터 마무리까지, MixMate</p>
      </div>
    </MobileFrame>
  );
}
