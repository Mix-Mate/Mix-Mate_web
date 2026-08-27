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

    // Take the last character entered, uppercase alphanumeric only
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const char = sanitized.slice(-1);

    const nextCode = [...code];
    nextCode[index] = char;
    setCode(nextCode);

    // Auto-focus next input if character entered
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace & Arrow navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        // Move to previous box if current is already empty
        const nextCode = [...code];
        nextCode[index - 1] = "";
        setCode(nextCode);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste event (supports copying full 6-digit code)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const pastedData = e.clipboardData
      .getData("text")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (!pastedData) return;

    const nextCode = [...code];
    for (let i = 0; i < 6; i++) {
      nextCode[i] = pastedData[i] || "";
    }
    setCode(nextCode);

    // Focus the next empty input or the last input
    const nextEmptyIndex = nextCode.findIndex((c) => c === "");
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const isCodeComplete = code.every((char) => char.trim().length === 1);

  // Handle Submit with API integration and status-based error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeComplete || isSubmitting) return;

    const fullCode = code.join("");
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. 실제 참여코드 검증 API 호출
      const result = await verifyInviteCodeApi({ inviteCode: fullCode });

      if (onSuccess) {
        onSuccess(fullCode);
        return;
      }

      // 200 성공 시: 응답받은 groupId, groupName을 상태로 전달하며 다음 단계(프로필/추가 정보 입력)로 전환
      router.push(groupRoutes.extra(String(result.groupId)));
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
        });
      } else if (
        errorStatus === 409 &&
        (errorCode === "ALREADY_STARTED" || errorObj.message.includes("시작"))
      ) {
        setErrorModal({
          open: true,
          title: "이미 시작된 그룹입니다",
          description: "입력하신 코드를 다시 확인해 주세요.",
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
      {/* 1. 상단 헤더: 뒤로가기(<) 버튼 + '그룹 입장하기' 헤더 타이틀 */}
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

      {/* 2. 메인 컨텐츠 영역 */}
      <main className={styles.main}>
        <form id="join-group-form" onSubmit={handleSubmit} className={styles.form}>
          {/* 타이틀 영역 */}
          <div className={styles.titleSection}>
            <h2 className={styles.mainTitle}>참여코드를 입력하세요</h2>
            <p className={styles.subTitle}>
              관리자에게 받은 6자리 코드를 입력합니다
            </p>
          </div>

          {/* OTP 스타일 6칸 인풋 박스 */}
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

      {/* 3. 하단 고정: '입장하기' 파란색 버튼 (6자리 모두 채워졌을 때만 활성화) */}
      <footer className={styles.footer}>
        <button
          type="submit"
          form="join-group-form"
          className={styles.submitButton}
          disabled={!isCodeComplete || isSubmitting}
        >
          {isSubmitting ? "확인 중..." : "입장하기"}
        </button>
      </footer>

      {/* 4. 경고 모달: 참여코드 만료 / 이미 시작됨 */}
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
            onClick={handleRetry}
          >
            다시 입력하기
          </button>
        </div>
      </BottomSheetDialog>
    </MobileFrame>
  );
}
