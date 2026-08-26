"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import { joinGroupByCode } from "@/features/group/api/group.api";
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

  // Handle Submit with API integration and status-based error modals
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeComplete || isSubmitting) return;

    const fullCode = code.join("");
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (onSuccess) {
        onSuccess(fullCode);
        return;
      }

      // 실제 참여코드 검증 및 그룹 참여 API 호출
      const result = await joinGroupByCode(fullCode);
      router.push(groupRoutes.home(result.groupId || fullCode.toLowerCase()));
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

      // 상황별 에러 모달 멘트 분기 처리
      if (
        errorStatus === 409 &&
        (errorCode === "EXPIRED" || errorObj.message.includes("만료"))
      ) {
        // 409 에러: 참여코드 만료
        setErrorModal({
          open: true,
          title: "참여코드가 만료되었습니다",
          description: "입력하신 코드를 다시 확인해 주세요.",
        });
      } else if (
        errorStatus === 409 &&
        (errorCode === "ALREADY_STARTED" || errorObj.message.includes("시작"))
      ) {
        // 409 에러: 이미 시작된 그룹
        setErrorModal({
          open: true,
          title: "이미 시작된 그룹입니다",
          description: "입력하신 코드를 다시 확인해 주세요.",
        });
      } else {
        // 404 또는 코드 불일치 / 미존재
        setErrorModal({
          open: true,
          title: "참여코드가 존재하지 않습니다",
          description: "입력하신 코드를 다시 확인해 주세요.",
        });
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
                }`}
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

      {/* 4. 경고 모달: 참여코드 불일치 / 만료 / 이미 시작됨 */}
      <BottomSheetDialog
        open={errorModal.open}
        titleId="join-error-title"
        descriptionId="join-error-desc"
        sheetClassName={styles.modalSheet}
        onClose={handleCloseErrorModal}
      >
        <div className={styles.modalIcon} aria-hidden="true">
          <AlertCircle size={26} strokeWidth={2} />
        </div>

        <div className={styles.modalContent}>
          <h2 id="join-error-title" className={styles.modalTitle}>
            {errorModal.title}
          </h2>
          <p id="join-error-desc" className={styles.modalDescription}>
            {errorModal.description}
          </p>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalCancelButton}
            onClick={handleCloseErrorModal}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.modalRetryButton}
            onClick={handleRetry}
          >
            다시 입력하기
          </button>
        </div>
      </BottomSheetDialog>
    </MobileFrame>
  );
}
