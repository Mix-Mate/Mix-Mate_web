"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Toast from "@/shared/ui/Toast";
import useToast from "@/shared/hooks/useToast";
import { createGroupApi, GroupApiError } from "@/features/group/api/group.api";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import styles from "./GroupCreateScreen.module.css";

interface GroupCreateScreenProps {
  onSuccess?: (groupId: string, code: string) => void;
}

export default function GroupCreateScreen({ onSuccess }: GroupCreateScreenProps) {
  const router = useRouter();

  // State requirements
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isCodeIssued, setIsCodeIssued] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [createdGroupId, setCreatedGroupId] = useState<number | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shared toast hook (2000ms auto dismiss)
  const { message, showToast } = useToast(2000);

  const handleBack = () => {
    router.back();
  };

  const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGroupName(e.target.value);
    if (fieldErrors.groupName) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.groupName;
        return next;
      });
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setDescription(e.target.value);
    if (fieldErrors.description) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.description;
        return next;
      });
    }
  };

  // Main button: [조 편성하기]
  const handleMainAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || isSubmitting) return;

    if (isCodeIssued && createdGroupId) {
      // 이미 생성 및 발급된 상태에서 다시 클릭 시 다음 페이지로 이동
      if (onSuccess) {
        onSuccess(String(createdGroupId), inviteCode);
      } else {
        router.push(groupRoutes.home(String(createdGroupId)));
      }
      return;
    }

    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      // 1. 그룹 생성 API 호출
      const response = await createGroupApi({
        groupName: groupName.trim(),
        description: description.trim(),
      });

      // 2. 201 성공: 발급된 inviteCode와 groupId 저장 후 모달 노출
      setInviteCode(response.inviteCode);
      setCreatedGroupId(response.groupId);
      setIsCodeIssued(true);
      setIsModalOpen(true);

      if (onSuccess) {
        onSuccess(String(response.groupId), response.inviteCode);
      }
    } catch (error: unknown) {
      if (error instanceof GroupApiError) {
        if (
          error.status === 400 &&
          error.fieldErrors &&
          Object.keys(error.fieldErrors).length > 0
        ) {
          // 400 Bad Request 필드별 에러 바인딩
          setFieldErrors(error.fieldErrors);
        } else if (error.status === 401) {
          // 401 Unauthorized 세션 만료 안내 후 로그인 이동
          alert("토큰이 없거나 만료되었습니다. 다시 로그인해 주세요.");
          router.push("/login");
          return;
        } else {
          // 500 또는 기타 에러
          setGeneralError(error.message || "서버 오류가 발생하였습니다.");
          showToast(error.message || "서버 오류가 발생하였습니다.");
        }
      } else {
        const fallbackMsg =
          error instanceof Error ? error.message : "그룹 생성에 실패했습니다.";
        setGeneralError(fallbackMsg);
        showToast(fallbackMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal action: [복사하기]
  const handleCopyCode = async () => {
    if (!inviteCode) return;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteCode);
      }
    } catch {
      // Fallback
    }

    showToast("참여코드가 복사되었습니다.");
  };

  // Modal close: 그룹 상세 화면으로 이동
  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (createdGroupId) {
      router.push(groupRoutes.home(String(createdGroupId)));
    }
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="group-create-screen"
    >
      {/* 1. 상단 헤더: 뒤로가기(<) 버튼 + '새 그룹 생성하기' 타이틀 */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
          aria-label="이전 화면으로 이동"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>

        <h1 className={styles.headerTitle}>새 그룹 생성하기</h1>
      </header>

      {/* 2. 메인 폼 입력 영역 */}
      <main className={styles.main}>
        <form
          id="create-group-form"
          onSubmit={handleMainAction}
          className={styles.form}
          noValidate
        >
          {/* 입력 1: 그룹명 (필수) */}
          <div className={styles.inputGroup}>
            <label htmlFor="group-name-input" className={styles.inputLabel}>
              그룹명 <span className={styles.requiredDot}>*</span>
            </label>
            <input
              id="group-name-input"
              type="text"
              className={`${styles.inputField} ${
                fieldErrors.groupName ? styles.inputError : ""
              }`}
              value={groupName}
              onChange={handleGroupNameChange}
              required
              autoFocus
            />
            {fieldErrors.groupName && (
              <span className={styles.fieldError} role="alert">
                {fieldErrors.groupName}
              </span>
            )}
          </div>

          {/* 입력 2: 설명 (선택) */}
          <div className={styles.inputGroup}>
            <label htmlFor="group-desc-input" className={styles.inputLabel}>
              설명 (선택)
            </label>
            <textarea
              id="group-desc-input"
              className={`${styles.textareaField} ${
                fieldErrors.description ? styles.inputError : ""
              }`}
              placeholder="설명 입력"
              value={description}
              onChange={handleDescriptionChange}
              rows={4}
            />
            {fieldErrors.description && (
              <span className={styles.fieldError} role="alert">
                {fieldErrors.description}
              </span>
            )}
          </div>

          {/* 안내 배너: 파란색 박스 (테두리 없음) */}
          <div className={styles.infoBanner} role="note">
            <Info size={18} className={styles.infoIcon} aria-hidden="true" />
            <p className={styles.infoText}>
              참여코드는 모임 생성 시 자동 발급됩니다.
            </p>
          </div>

          {/* 공통 에러 메시지 */}
          {generalError && (
            <div className={styles.generalError} role="alert">
              {generalError}
            </div>
          )}
        </form>
      </main>

      {/* 3. 하단 고정: '조 편성하기' 파란색 버튼 */}
      <footer className={styles.footer}>
        <button
          type="submit"
          form="create-group-form"
          className={styles.submitButton}
          disabled={!groupName.trim() || isSubmitting}
        >
          {isSubmitting
            ? "생성 중..."
            : isCodeIssued
              ? "모임으로 이동하기"
              : "조 편성하기"}
        </button>
      </footer>

      {/* 4. 참여코드 발급 바텀시트 모달 */}
      <BottomSheetDialog
        open={isModalOpen}
        titleId="issued-code-label"
        scrimClassName={styles.modalScrim}
        sheetClassName={styles.modalSheet}
        onClose={handleCloseModal}
      >
        <div className={styles.modalContent}>
          <span id="issued-code-label" className={styles.codeLabel}>
            참여코드
          </span>

          <p className={styles.codeText}>{inviteCode}</p>

          <span className={styles.codeSubtext}>클릭해서 복사하기</span>
        </div>

        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopyCode}
        >
          복사하기
        </button>
      </BottomSheetDialog>

      {/* 5. 클립보드 복사 성공 토스트 알림 */}
      {message && (
        <Toast className={styles.toastContainer}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.toastIcon}
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="8" fill="#008A2E" />
            <path
              d="M4.5 8L6.8 10.3L11.5 5.5"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{message}</span>
        </Toast>
      )}
    </MobileFrame>
  );
}
