"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileFrame from "@/shared/ui/MobileFrame";
import { loginWithKakaoApi, AuthApiError } from "../api/auth.api";
import { saveAuthSession } from "../utils/auth-session";
import { KAKAO_OAUTH_STATE_KEY } from "../utils/kakao-auth";
import styles from "./KakaoCallbackScreen.module.css";

export default function KakaoCallbackScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const navigateToLoginWithError = (message: string) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("authToast", message);
      }
      router.replace(`/login?toast=${encodeURIComponent(message)}`);
    };

    const kakaoError = searchParams.get("error");
    if (kakaoError) {
      const errorDescription =
        searchParams.get("error_description") ||
        "카카오 로그인이 취소되었거나 실패했습니다.";
      navigateToLoginWithError(errorDescription);
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const savedState =
      typeof window !== "undefined"
        ? sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY)
        : null;

    // CSRF 방지용 state 검증
    if (!state || !savedState || state !== savedState || !code) {
      navigateToLoginWithError("비정상적인 접근입니다.");
      return;
    }

    // 검증 완료 후 일회성 state 제거
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY);
    }

    async function handleKakaoAuth() {
      try {
        const response = await loginWithKakaoApi(code as string);

        // 로그인 성공 시 세션 저장 후 메인 이동
        saveAuthSession(response);
        router.replace("/home");
      } catch (error: unknown) {
        if (error instanceof AuthApiError) {
          if (error.status === 409 || error.code === "EMAIL_CONFLICTED") {
            navigateToLoginWithError(
              "이미 가입된 이메일입니다. 기존 방법으로 로그인해주세요.",
            );
            return;
          }

          navigateToLoginWithError(
            error.message || "카카오 로그인 처리에 실패했습니다.",
          );
          return;
        }

        navigateToLoginWithError(
          error instanceof Error
            ? error.message
            : "카카오 로그인 중 오류가 발생했습니다.",
        );
      }
    }

    handleKakaoAuth();
  }, [router, searchParams]);

  return (
    <MobileFrame data-testid="kakao-callback-screen">
      <div className={styles.container}>
        <div className={styles.spinner} role="status" aria-label="로딩 중" />
        <h1 className={styles.title}>카카오 로그인 처리 중</h1>
        <p className={styles.description}>잠시만 기다려 주세요...</p>
      </div>
    </MobileFrame>
  );
}
