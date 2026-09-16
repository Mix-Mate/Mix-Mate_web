"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileFrame from "@/shared/ui/MobileFrame";
import { loginWithGoogleApi, AuthApiError } from "../api/auth.api";
import { saveAuthSession } from "../utils/auth-session";
import { GOOGLE_OAUTH_STATE_KEY } from "../utils/google-auth";
import { consumePostLoginRedirect } from "../utils/post-login-redirect";
import styles from "./GoogleCallbackScreen.module.css";

export default function GoogleCallbackScreen() {
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

    const googleError = searchParams.get("error");
    if (googleError) {
      const errorDescription =
        searchParams.get("error_description") ||
        "구글 로그인이 취소되었거나 실패했습니다.";
      navigateToLoginWithError(errorDescription);
      return;
    }

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const savedState =
      typeof window !== "undefined"
        ? sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY)
        : null;

    // CSRF 방지용 state 검증
    if (!state || !savedState || state !== savedState || !code) {
      navigateToLoginWithError("비정상적인 접근입니다.");
      return;
    }

    // 검증 완료 후 일회성 state 제거
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
    }

    async function handleGoogleAuth() {
      try {
        const response = await loginWithGoogleApi(code as string);

        // 로그인 전에 보던 초대 링크 등이 있으면 복귀하고, 없으면 메인으로 이동
        saveAuthSession(response);
        router.replace(consumePostLoginRedirect() ?? "/home");
      } catch (error: unknown) {
        if (error instanceof AuthApiError) {
          if (error.status === 409 || error.code === "EMAIL_CONFLICTED") {
            navigateToLoginWithError(
              "이미 가입된 이메일입니다. 기존 방법으로 로그인해주세요.",
            );
            return;
          }

          navigateToLoginWithError(
            error.message || "구글 로그인 처리에 실패했습니다.",
          );
          return;
        }

        navigateToLoginWithError(
          error instanceof Error
            ? error.message
            : "구글 로그인 중 오류가 발생했습니다.",
        );
      }
    }

    handleGoogleAuth();
  }, [router, searchParams]);

  return (
    <MobileFrame data-testid="google-callback-screen">
      <div className={styles.container}>
        <div className={styles.spinner} role="status" aria-label="로딩 중" />
        <h1 className={styles.title}>구글 로그인 처리 중</h1>
        <p className={styles.description}>잠시만 기다려 주세요...</p>
      </div>
    </MobileFrame>
  );
}
