"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
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

  const handleBack = () => {
    router.back();
  };

  // Main button: [조 편성하기]
  const handleMainAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("pendingGroupName", groupName.trim());
      window.sessionStorage.setItem("pendingGroupDesc", description.trim());
    }

    if (onSuccess) {
      onSuccess(groupName.trim(), "");
    } else {
      router.push(
        `${groupRoutes.createExtra()}?groupName=${encodeURIComponent(
          groupName.trim(),
        )}&description=${encodeURIComponent(description.trim())}&role=admin&from=create`,
      );
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
    </MobileFrame>
  );
}
