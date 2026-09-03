"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import { verifyInviteCodeApi } from "@/features/group/api/group.api";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import styles from "./GroupJoinScreen.module.css";

interface GroupJoinScreenProps {
  onSuccess?: (inviteCode: string) => void;
  onJoinError?: (errorCode: string) => void;
}

interface ErrorModalState {
  open: boolean;
  title: string;
  description: string;
  isBlocked?: boolean;
}

export default function GroupJoinScreen({ onSuccess, onJoinError }: GroupJoinScreenProps) {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    open: false,
    title: "",
    description: "",
    isBlocked: false,
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on initial mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleCloseErrorModal = () => {
    setErrorModal((prev) => ({ ...prev, open: false }));
  };

  const handleRetry = () => {
    setErrorModal((prev) => ({ ...prev, open: false }));
    // Clear all 6 input fields and focus the first box
    setCode(["", "", "", "", "", ""]);
    setErrorMessage("");
    inputRefs.current[0]?.focus();
  };

  // Handle single character input
  const handleChange = (index: number, value: string) => {
    setErrorMessage("");

    // Handle paste or multi-char input in a single box
    if (value.length > 1) {
      const chars = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6).split("");
      const newCode = [...code];
      chars.forEach((c, i) => {
        if (i < 6) newCode[i] = c;
      });
      setCode(newCode);
      const nextFocus = Math.min(chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const char = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    // Auto-advance to next input if filled
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste full code into any box
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);

    if (!pasteData) return;

    const newCode = [...code];
    pasteData.split("").forEach((char, index) => {
      if (index < 6) {
        newCode[index] = char;
      }
    });
    setCode(newCode);
    setErrorMessage("");

    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Submit flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6 || isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // 1. 실제 참여코드 검증 API 호출
      const result = await verifyInviteCodeApi({ inviteCode: fullCode });

      if (onSuccess) {
        onSuccess(fullCode);
        return;
      }

      // 200 성공 시: 참여코드를 저장하고 추가 정보 입력 화면으로 전환
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("pendingInviteCode", fullCode);
      }

      router.push(
        `${groupRoutes.extra(String(result.groupId))}?from=join&inviteCode=${encodeURIComponent(
          fullCode,
        )}`,
      );
    } catch (err: unknown) {
      const errorObj =
        err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.");
      const errorStatus =
        err && typeof err === "object" && "status" in err
          ? (err as { status?: number }).status
          : undefined;
      const errorCode =
        err && typeof err === "object" && "code" in err
          ? (err as { code?: string }).code
          : undefined;

      if (onJoinError) {
        onJoinError(errorCode || errorObj.message);
      }

      // 401 Unauthorized: 로그인 세션 만료 안내 후 로그인 화면(/login)으로 리다이렉트
      if (errorStatus === 401) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        router.push("/login");
        return;
      }

      // 403 Forbidden / 차단 상태
      if (
        errorStatus === 403 ||
        errorCode === "USER_BLOCKED" ||
        errorCode === "BANNED_USER" ||
        errorCode === "FORBIDDEN" ||
        errorObj.message.includes("차단")
      ) {
        setErrorModal({
          open: true,
          title: "그룹 참여가 제한되었습니다",
          description:
            errorObj.message || "해당 그룹 관리자에 의해 참여가 차단된 사용자입니다.",
          isBlocked: true,
        });
        return;
      }

      // 404 Not Found: 인풋 하단에 "유효하지 않은 초대코드입니다." 빨간색 텍스트 렌더링
      if (errorStatus === 404 || errorCode === "INVALID_INVITE_CODE") {
        setErrorMessage(errorObj.message || "유효하지 않은 초대코드입니다.");
        return;
      }

      // 상황별 에러 모달 멘트 분기 처리 (409 등)
      if (
        errorStatus === 409 &&
        (errorCode === "EXPIRED" || errorObj.message.includes("만료"))
      ) {
        setErrorModal({
          open: true,
          title: "참여코드가 만료되었습니다",
          description: "입력하신 코드를 다시 확인해 주세요.",
          isBlocked: false,
        });
      } else if (
        errorStatus === 409 &&
        (errorCode === "ALREADY_STARTED" || errorObj.message.includes("시작"))
      ) {
        setErrorModal({
          open: true,
          title: "이미 시작된 그룹입니다",
          description: "입력하신 코드를 다시 확인해 주세요.",
          isBlocked: false,
        });
      } else {
        // 기타 400 등 에러는 인풋 하단 에러 텍스트로 노출
        setErrorMessage(errorObj.message || "유효하지 않은 초대코드입니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="group-join-screen"
    >
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          aria-label="이전 화면으로 이동"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>

        <h1 className={styles.headerTitle}>그룹 입장하기</h1>
      </header>

      <main className={styles.main}>
        <form id="join-group-form" onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.titleSection}>
            <h2 className={styles.mainTitle}>참여코드를 입력하세요</h2>
            <p className={styles.subTitle}>
              관리자에게 받은 6자리 코드를 입력합니다
            </p>
          </div>

          <div
            className={styles.otpContainer}
            role="group"
            aria-label="6자리 참여코드 입력"
          >
            {code.map((char, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                id={`otp-input-${index}`}
                type="text"
                className={`${styles.otpInput} ${
                  char ? styles.otpInputFilled : ""
                } ${errorMessage ? styles.otpInputError : ""}`}
                value={char}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                maxLength={1}
                autoComplete="one-time-code"
                inputMode="text"
                aria-label={`참여코드 ${index + 1}번째 자리`}
              />
            ))}
          </div>

          {errorMessage && (
            <p className={styles.errorMessage} role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      </main>

      <footer className={styles.footer}>
        <button
          type="submit"
          form="join-group-form"
          className={styles.submitButton}
          disabled={code.join("").length !== 6 || isSubmitting}
        >
          {isSubmitting ? "확인 중..." : "입장하기"}
        </button>
      </footer>

      <BottomSheetDialog
        open={errorModal.open}
        titleId="error-dialog-title"
        descriptionId="error-dialog-desc"
        scrimClassName={styles.modalScrim}
        sheetClassName={styles.modalSheet}
        onClose={handleCloseErrorModal}
      >
        <div className={styles.modalIcon} aria-hidden="true">
          <AlertCircle size={32} strokeWidth={2} />
        </div>

        <div className={styles.modalContent}>
          <h2 id="error-dialog-title" className={styles.modalTitle}>
            {errorModal.title}
          </h2>
          <p id="error-dialog-desc" className={styles.modalDescription}>
            {errorModal.description}
          </p>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.retryButton}
            onClick={errorModal.isBlocked ? () => router.replace("/home") : handleRetry}
          >
            {errorModal.isBlocked ? "홈으로 이동" : "다시 입력하기"}
          </button>
        </div>
      </BottomSheetDialog>
    </MobileFrame>
  );
}
