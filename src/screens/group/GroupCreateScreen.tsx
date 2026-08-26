"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Toast from "@/shared/ui/Toast";
import useToast from "@/shared/hooks/useToast";
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

  // Shared toast hook (2000ms auto dismiss)
  const { message, showToast } = useToast(2000);

  // Generate 6-digit random code (e.g., 7K2M91)
  const generateRandomCode = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleBack = () => {
    router.back();
  };

  // Main button: [조 편성하기]
  const handleMainAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (!isCodeIssued) {
      // Flow ①: 처음 클릭 시 참여코드 발급 후 모달 띄우기
      const newCode = generateRandomCode();
      setInviteCode(newCode);
      setIsCodeIssued(true);
      setIsModalOpen(true);
    } else {
      // Flow ④: 이미 발급된 상태에서 다시 클릭 시 다음 페이지로 이동
      if (onSuccess) {
        onSuccess(groupName.trim(), inviteCode);
      } else {
        router.push(groupRoutes.createExtra());
      }
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

    // Flow ②: 토스트 2초간 노출
    showToast("참여코드가 복사되었습니다.");
  };

  // Flow ③: 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
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
        <form id="create-group-form" onSubmit={handleMainAction} className={styles.form}>
          {/* 입력 1: 그룹명 (필수) */}
          <div className={styles.inputGroup}>
            <label htmlFor="group-name-input" className={styles.inputLabel}>
              그룹명 <span className={styles.requiredDot}>*</span>
            </label>
            <input
              id="group-name-input"
              type="text"
              className={styles.inputField}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* 입력 2: 설명 (선택) */}
          <div className={styles.inputGroup}>
            <label htmlFor="group-desc-input" className={styles.inputLabel}>
              설명 (선택)
            </label>
            <textarea
              id="group-desc-input"
              className={styles.textareaField}
              placeholder="설명 입력"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* 안내 배너: 파란색 박스 (테두리 없음) */}
          <div className={styles.infoBanner} role="note">
            <Info size={18} className={styles.infoIcon} aria-hidden="true" />
            <p className={styles.infoText}>
              참여코드는 모임 생성 시 자동 발급됩니다.
            </p>
          </div>
        </form>
      </main>

      {/* 3. 하단 고정: '조 편성하기' 파란색 버튼 */}
      <footer className={styles.footer}>
        <button
          type="submit"
          form="create-group-form"
          className={styles.submitButton}
          disabled={!groupName.trim()}
        >
          조 편성하기
        </button>
      </footer>

      {/* 4. 참여코드 발급 바텀시트 모달 */}
      <BottomSheetDialog
        open={isModalOpen}
        titleId="issued-code-label"
        sheetClassName={styles.modalSheet}
        onClose={handleCloseModal}
      >
        <div className={styles.modalContent}>
          <span id="issued-code-label" className={styles.codeLabel}>
            참여코드
          </span>

          <p className={styles.codeText}>{inviteCode}</p>

          <span className={styles.codeSubtext}>
            클릭해서 복사하기
          </span>
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
