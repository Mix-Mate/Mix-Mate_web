"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import Header from "@/shared/ui/Header";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";
import {
  GroupApiError,
  isExplicitGroupBlockError,
  verifyInviteCodeApi,
} from "@/features/group/api/group.api";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import {
  recordBlockedGroup,
  saveKnownGroupName,
} from "@/features/blacklist/lib/blockedGroupsStorage";
import styles from "./GroupJoinScreen.module.css";

interface ErrorModalState {
  open: boolean;
  title: string;
  description: string;
  isBlocked?: boolean;
  redirectToLogin?: boolean;
}

export default function GroupJoinScreen() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    open: false,
    title: "",
    description: "",
    isBlocked: false,
    redirectToLogin: false,
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on initial mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const resetInputsAndFocus = () => {
    setCode(["", "", "", "", "", ""]);
    setErrorMessage("");
    inputRefs.current[0]?.focus();
  };

  const handleCloseErrorModal = () => {
    if (errorModal.redirectToLogin) {
      router.push("/login");
      return;
    }
    if (errorModal.isBlocked) {
      router.replace("/home");
      return;
    }
    setErrorModal((prev) => ({ ...prev, open: false }));
    resetInputsAndFocus();
  };

  const handleRetry = () => {
    setErrorModal((prev) => ({ ...prev, open: false }));
    resetInputsAndFocus();
  };

  // Handle single character input
  const handleChange = (index: number, value: string) => {
    setErrorMessage("");

    // Handle paste or multi-char input in a single box
    if (value.length > 1) {
      const chars = value
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 6)
        .split("");
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
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
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
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const fullCode = code.join("");
    if (fullCode.length !== 6 || isSubmitting) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // 1. 코드 입력 후 다음 단계로 이동하기 전에 반드시 verifyInviteCodeApi(code)를 await로 호출
      const result = await verifyInviteCodeApi(fullCode);

      // 응답 검증: API 결과 및 groupId가 유효해야 함
      if (!result || !result.groupId) {
        throw new GroupApiError("유효하지 않은 초대코드입니다.", 404, "INVALID_INVITE_CODE");
      }

      // 1단계 200 OK 응답 본문 차단 필드 점검 (isBlocked, blocked, userStatus, status 등)
      const isUserBlocked =
        result.isBlocked === true ||
        result.blocked === true ||
        result.userStatus?.toUpperCase() === "BLOCKED" ||
        result.userStatus?.toUpperCase() === "BANNED" ||
        result.status?.toUpperCase() === "BLOCKED" ||
        result.status?.toUpperCase() === "BANNED";

      if (isUserBlocked) {
        if (result.groupId) {
          recordBlockedGroup({
            groupId: String(result.groupId),
            groupName: result.groupName || "그룹",
          });
        }
        setErrorModal({
          open: true,
          title: "그룹 참여가 제한되었습니다",
          description: "해당 그룹에서 차단되어 참여할 수 없습니다.",
          isBlocked: true,
        });
        return;
      }

      // 응답에 status가 있고 RECRUITING이 아닌 경우 추가 정보 입력 화면으로 넘어가지 않고 즉시 차단
      const statusUpper = result.status?.trim().toUpperCase();
      if (statusUpper && statusUpper !== "RECRUITING") {
        const isRecruitmentClosed =
          statusUpper === "BEFORE_FIRST_ROUND" ||
          statusUpper === "RECRUITMENT_CLOSED" ||
          statusUpper === "CLOSED";

        setErrorMessage(
          isRecruitmentClosed
            ? "참가자 모집이 마감된 그룹입니다."
            : "이미 시작된 그룹입니다.",
        );
        return;
      }

      // 200 성공 시: 참여코드 및 그룹명을 저장하고 추가 정보 입력 화면으로 전환
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("pendingInviteCode", fullCode);
        window.sessionStorage.setItem("pendingGroupId", String(result.groupId));
        if (result.groupName) {
          window.sessionStorage.setItem("pendingGroupName", result.groupName);
          window.sessionStorage.setItem(
            `groupName_${result.groupId}`,
            result.groupName,
          );
        }
      }

      if (result.groupId && result.groupName) {
        saveKnownGroupName(result.groupId, result.groupName);
      }

      const queryParams = new URLSearchParams({
        from: "join",
        inviteCode: fullCode,
      });
      if (result.groupName) {
        queryParams.set("groupName", result.groupName);
      }

      // API 응답이 성공(200 OK)이고 에러가 없을 때만 router.push() 실행
      router.push(
        `${groupRoutes.extra(String(result.groupId))}?${queryParams.toString()}`,
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
      const errorReason =
        err && typeof err === "object" && "reason" in err
          ? (err as { reason?: string }).reason
          : undefined;
      const errGroupId =
        err && typeof err === "object" && "groupId" in err
          ? (err as { groupId?: string | number }).groupId
          : undefined;
      const errGroupName =
        err && typeof err === "object" && "groupName" in err
          ? (err as { groupName?: string }).groupName
          : undefined;

      // 401 Unauthorized: 로그인 세션 만료 안내 후 로그인 화면(/login)으로 리다이렉트
      if (errorStatus === 401) {
        setErrorModal({
          open: true,
          title: "로그인 세션이 만료되었습니다",
          description: "다시 로그인한 후 그룹 참여를 진행해 주세요.",
          isBlocked: false,
          redirectToLogin: true,
        });
        return;
      }

      // 범용 403/FORBIDDEN은 제외하고 명시적인 차단 응답만 처리한다.
      if (isExplicitGroupBlockError(err)) {
        if (errGroupId) {
          recordBlockedGroup({
            groupId: String(errGroupId),
            groupName: errGroupName || "그룹",
            reason: errorReason,
          });
        }

        setErrorModal({
          open: true,
          title: "그룹 참여가 제한되었습니다",
          description: "해당 그룹에서 차단되어 참여할 수 없습니다.",
          isBlocked: true,
        });
        return;
      }

      // 409 Conflict: 마감된 그룹 (INVALID_GROUP_STATUS 등)
      const isClosedError =
        errorCode === "INVALID_GROUP_STATUS" ||
        (errorStatus === 409 &&
          (errorCode === "RECRUITMENT_CLOSED" ||
            errorCode === "CLOSED" ||
            errorCode === "GROUP_FULL" ||
            errorCode === "MAX_CAPACITY" ||
            errorObj.message.includes("마감") ||
            errorObj.message.includes("정원") ||
            errorObj.message.includes("초과") ||
            (!errorCode && !errorObj.message.includes("만료"))));

      if (isClosedError) {
        setErrorMessage("참가자 모집이 마감된 그룹입니다.");
        return;
      }

      // 404 Not Found: 인풋 하단에 "유효하지 않은 초대코드입니다." 빨간색 텍스트 렌더링
      const isInvalidCodeError =
        errorStatus === 404 ||
        errorCode === "INVALID_INVITE_CODE" ||
        errorCode === "INVALID_CODE";

      if (isInvalidCodeError) {
        setErrorMessage("유효하지 않은 초대코드입니다.");
        return;
      }

      // 상황별 에러 모달 멘트 분기 처리 (참여코드 만료 등 409)
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
        return;
      }

      // 이미 시작된 그룹 등
      if (
        errorCode === "ALREADY_STARTED" ||
        errorObj.message.includes("시작") ||
        errorObj.message.includes("종료")
      ) {
        setErrorModal({
          open: true,
          title: "이미 시작된 그룹입니다",
          description: "모집이 완료되었거나 이미 시작되어 참여할 수 없습니다.",
          isBlocked: false,
        });
        return;
      }

      // 기타 400 등 에러는 인풋 하단 에러 텍스트로 노출
      setErrorMessage(errorObj.message || "유효하지 않은 초대코드입니다.");
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
      {/* 1. 상단 헤더: 공통 Header 컴포넌트 적용 */}
      <Header title="그룹 입장하기" onBack={handleBack} />

      <main className={styles.main}>
        <form
          id="join-group-form"
          onSubmit={handleSubmit}
          className={styles.form}
        >
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
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={code.join("").length !== 6 || isSubmitting}
        >
          {isSubmitting ? "확인 중..." : "입장하기"}
        </button>
      </footer>

      <StandardDialog
        open={errorModal.open}
        titleId="error-dialog-title"
        descriptionId="error-dialog-desc"
        onClose={handleCloseErrorModal}
        icon={<AlertCircle size={27} strokeWidth={2} />}
        title={errorModal.title}
        description={errorModal.description}
        actions={
          <Button
            variant="danger"
            onClick={
              errorModal.redirectToLogin
                ? () => router.push("/login")
                : errorModal.isBlocked
                  ? () => router.replace("/home")
                  : handleRetry
            }
          >
            {errorModal.redirectToLogin
              ? "로그인하기"
              : errorModal.isBlocked
                ? "홈으로 이동"
                : "다시 입력하기"}
          </Button>
        }
      />
    </MobileFrame>
  );
}
