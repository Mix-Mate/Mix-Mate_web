"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock, LogOut } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import Header from "@/shared/ui/Header";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import { authRoutes } from "@/shared/lib/navigation/routes";
import { performLogout } from "@/features/auth/api/auth.api";
import styles from "./MyPageScreen.module.css";

interface StoredUserInfo {
  userName: string;
  email: string;
}

function getStoredUserInfo(): StoredUserInfo {
  if (typeof window === "undefined") {
    return {
      userName: "사용자",
      email: "user@mixmate.kr",
    };
  }

  const userName =
    window.localStorage.getItem("userName") ||
    window.localStorage.getItem("displayName") ||
    "사용자";
  const email = window.localStorage.getItem("email") || "user@mixmate.kr";

  return {
    userName,
    email,
  };
}

export default function MyPageScreen() {
  const router = useRouter();

  // Storage synced user profile info
  const [userInfo, setUserInfo] = useState<StoredUserInfo>(getStoredUserInfo);

  // Modal states
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  // [회원탈퇴 보류] const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setUserInfo(getStoredUserInfo());
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handlePasswordChange = () => {
    router.push(authRoutes.changePassword());
  };

  // Logout action
  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await performLogout();
      setIsLogoutModalOpen(false);
      router.push(authRoutes.login());
    } finally {
      setIsLoggingOut(false);
    }
  };

  /* [회원탈퇴 기능 보류 - 추후 필요 시 주석 해제]
  const handleConfirmWithdraw = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await performLogout();
      setIsWithdrawModalOpen(false);
      alert("회원 탈퇴가 정상적으로 처리되었습니다. 이용해 주셔서 감사합니다.");
      router.push(authRoutes.login());
    } finally {
      setIsLoggingOut(false);
    }
  };
  */

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="mypage-screen"
    >
      {/* 1. 상단 네비게이션 헤더 */}
      <Header title="마이페이지" onBack={handleBack} />

      {/* 2. 메인 컨텐츠 영역 */}
      <main className={styles.main}>
        {/* 프로필 카드 (아바타 + 유저 이름 + 이메일) */}
        <section className={styles.profileCard} aria-label="프로필 요약">
          <GenderAvatar
            gender="male"
            name={userInfo.userName}
            size={60}
            className={styles.profileAvatar}
          />

          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{userInfo.userName}</h2>
            <p className={styles.profileEmail}>{userInfo.email}</p>
          </div>
        </section>

        {/* 계정 관리 섹션 (비밀번호 변경) */}
        <section className={styles.menuSection} aria-label="계정 관리">
          <h3 className={styles.sectionTitle}>계정 관리</h3>

          <div className={styles.menuCard}>
            <button
              type="button"
              className={styles.menuItem}
              onClick={handlePasswordChange}
            >
              <div className={styles.menuItemLeft}>
                <span className={styles.menuItemIcon}>
                  <Lock size={18} aria-hidden="true" />
                </span>
                <span className={styles.menuItemLabel}>비밀번호 변경</span>
              </div>
              <div className={styles.menuItemRight}>
                <ChevronRight size={18} aria-hidden="true" />
              </div>
            </button>
          </div>
        </section>

        {/* 기타 섹션 (로그아웃) */}
        <section className={styles.menuSection} aria-label="기타">
          <h3 className={styles.sectionTitle}>기타</h3>

          <div className={styles.dangerCard}>
            <button
              type="button"
              className={styles.dangerMenuItem}
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <div className={styles.menuItemLeft}>
                <span className={styles.menuItemIcon}>
                  <LogOut size={18} aria-hidden="true" />
                </span>
                <span className={styles.logoutLabel}>로그아웃</span>
              </div>
              <div className={styles.menuItemRight}>
                <ChevronRight size={18} aria-hidden="true" />
              </div>
            </button>

            {/* [회원탈퇴 기능 보류 - 추후 필요 시 주석 해제]
            <button
              type="button"
              className={styles.dangerMenuItem}
              onClick={() => setIsWithdrawModalOpen(true)}
            >
              <div className={styles.menuItemLeft}>
                <span className={`${styles.menuItemIcon} ${styles.withdrawLabel}`}>
                  <UserX size={18} aria-hidden="true" />
                </span>
                <span className={styles.withdrawLabel}>회원탈퇴</span>
              </div>
              <div className={styles.menuItemRight}>
                <ChevronRight size={18} aria-hidden="true" />
              </div>
            </button>
            */}
          </div>
        </section>
      </main>

      {/* 3. 로그아웃 확인 바텀시트 모달 (기존 공통 모달 형식 일치) */}
      <BottomSheetDialog
        open={isLogoutModalOpen}
        titleId="logout-modal-title"
        descriptionId="logout-modal-description"
        scrimClassName={styles.modalScrim}
        sheetClassName={styles.modalSheet}
        onClose={() => setIsLogoutModalOpen(false)}
        closeDisabled={isLoggingOut}
      >
        <div className={`${styles.modalIcon} ${styles.modalIconDanger}`}>
          <LogOut size={24} strokeWidth={2} aria-hidden="true" />
        </div>

        <div className={styles.modalContent}>
          <h3 id="logout-modal-title" className={styles.modalTitle}>
            로그아웃할까요?
          </h3>
          <p id="logout-modal-description" className={styles.modalDescription}>
            언제든지 다시 로그인하여 서비스를 이용하실 수 있습니다.
          </p>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalCancelButton}
            onClick={() => setIsLogoutModalOpen(false)}
            disabled={isLoggingOut}
          >
            취소
          </button>

          <button
            type="button"
            className={`${styles.modalConfirmButton} ${styles.modalDangerButton}`}
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      </BottomSheetDialog>

      {/* [회원탈퇴 확인 바텀시트 모달 - 보류로 주석 처리]
      <BottomSheetDialog
        open={isWithdrawModalOpen}
        titleId="withdraw-dialog-title"
        descriptionId="withdraw-dialog-description"
        scrimClassName={styles.modalScrim}
        sheetClassName={styles.modalSheet}
        onClose={() => setIsWithdrawModalOpen(false)}
        closeDisabled={isLoggingOut}
      >
        <div className={`${styles.modalIcon} ${styles.modalIconDanger}`} aria-hidden="true">
          <UserX size={24} strokeWidth={2} />
        </div>

        <div className={styles.modalContent}>
          <h2 id="withdraw-dialog-title" className={styles.modalTitle}>
            정말 탈퇴하시겠습니까?
          </h2>
          <p id="withdraw-dialog-description" className={styles.modalDescription}>
            회원 탈퇴 시 등록된 프로필 정보 및 모든 모임 참여 기록이 영구 삭제되며 복구할 수 없습니다.
          </p>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalCancelButton}
            onClick={() => setIsWithdrawModalOpen(false)}
            disabled={isLoggingOut}
          >
            취소
          </button>

          <button
            type="button"
            className={`${styles.modalConfirmButton} ${styles.modalDangerButton}`}
            onClick={handleConfirmWithdraw}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "탈퇴 처리 중..." : "탈퇴하기"}
          </button>
        </div>
      </BottomSheetDialog>
      */}
    </MobileFrame>
  );
}
