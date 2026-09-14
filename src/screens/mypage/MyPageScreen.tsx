"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock, LogOut, Pencil, UserX } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import Header from "@/shared/ui/Header";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import Button from "@/shared/ui/Button";
import StandardDialog from "@/shared/ui/StandardDialog";
import Toast from "@/shared/ui/Toast";
import useToast from "@/shared/hooks/useToast";
import { appRoutes, authRoutes } from "@/shared/lib/navigation/routes";
import {
  AuthApiError,
  performLogout,
  performWithdraw,
} from "@/features/auth/api/auth.api";
import {
  updateUserNameApi,
  validateUserName,
} from "@/features/user/api/user.api";
import styles from "./MyPageScreen.module.css";

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredUserName(): string {
  if (typeof window === "undefined") return "사용자";
  return (
    window.localStorage.getItem("userName") ||
    window.localStorage.getItem("displayName") ||
    "사용자"
  );
}

function getStoredEmail(): string {
  if (typeof window === "undefined") return "user@mixmate.kr";
  return window.localStorage.getItem("email") || "user@mixmate.kr";
}

function getStoredProvider(): string {
  if (typeof window === "undefined") return "local";
  return window.localStorage.getItem("provider") || "local";
}

function getServerUserNameSnapshot(): string {
  return "사용자";
}

function getServerEmailSnapshot(): string {
  return "user@mixmate.kr";
}

function getServerProviderSnapshot(): string {
  return "local";
}

function getWithdrawErrorMessage(error: unknown, isSocialAccount: boolean) {
  if (!(error instanceof Error)) {
    return "회원탈퇴에 실패했습니다.";
  }

  if (isSocialAccount) {
    return error.message || "회원탈퇴에 실패했습니다.";
  }

  if (error.message === "이메일 또는 비밀번호가 일치하지 않습니다.") {
    return "비밀번호가 일치하지 않습니다.";
  }

  if (
    error instanceof AuthApiError &&
    (error.status === 400 || error.status === 401)
  ) {
    return "비밀번호가 일치하지 않습니다.";
  }

  return error.message;
}

export default function MyPageScreen() {
  const router = useRouter();
  const { message: toast, showToast } = useToast();

  // Storage synced user profile info
  const userName = useSyncExternalStore(
    subscribeStorage,
    getStoredUserName,
    getServerUserNameSnapshot,
  );

  const email = useSyncExternalStore(
    subscribeStorage,
    getStoredEmail,
    getServerEmailSnapshot,
  );

  const provider = useSyncExternalStore(
    subscribeStorage,
    getStoredProvider,
    getServerProviderSnapshot,
  );
  const isSocialAccount = provider !== "local";

  // Edit Name states
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNameError, setEditNameError] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const editNameInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const withdrawPasswordInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    router.back();
  };

  const handlePasswordChange = () => {
    router.push(authRoutes.changePassword());
  };

  const handlePrivacyPolicy = () => {
    router.push(appRoutes.privacy());
  };

  const handleOpenEditNameModal = () => {
    setEditName(userName);
    setEditNameError("");
    setIsEditNameModalOpen(true);
  };

  const handleEditNameChange = (value: string) => {
    setEditName(value);
    if (editNameError) setEditNameError("");
  };

  const handleConfirmUpdateName = async () => {
    if (isUpdatingName) return;

    const rawValue = editNameInputRef.current?.value ?? editName;
    const trimmed = rawValue.trim();

    const validationError = validateUserName(trimmed);
    if (validationError) {
      setEditNameError(validationError);
      return;
    }

    setIsUpdatingName(true);
    setEditNameError("");

    try {
      await updateUserNameApi(trimmed);
      window.localStorage.setItem("userName", trimmed);
      window.dispatchEvent(new Event("storage"));
      setIsEditNameModalOpen(false);
      showToast("이름이 변경되었습니다.");
    } catch (error) {
      setEditNameError(
        error instanceof Error ? error.message : "이름 변경에 실패했습니다.",
      );
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleWithdrawPasswordChange = (value: string) => {
    setWithdrawPassword(value);
    if (withdrawError) setWithdrawError("");
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

  const handleConfirmWithdraw = async () => {
    if (isWithdrawing) return;

    let password: string | undefined;

    if (!isSocialAccount) {
      password = (
        withdrawPasswordInputRef.current?.value ?? withdrawPassword
      ).trim();

      if (!password) {
        setWithdrawError("비밀번호를 입력해주세요.");
        return;
      }
    }

    setIsWithdrawing(true);
    setWithdrawError("");

    try {
      await performWithdraw(password);
      setIsWithdrawModalOpen(false);
      setWithdrawPassword("");
      router.push(authRoutes.login());
    } catch (error) {
      setWithdrawError(getWithdrawErrorMessage(error, isSocialAccount));
    } finally {
      setIsWithdrawing(false);
    }
  };

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
            name={userName}
            size={60}
            className={styles.profileAvatar}
          />

          <div className={styles.profileInfo}>
            <div className={styles.profileNameRow}>
              <h2 className={styles.profileName}>{userName}</h2>
              <button
                type="button"
                className={styles.editNameButton}
                onClick={handleOpenEditNameModal}
                aria-label="이름 수정"
              >
                <Pencil size={12} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
            <p className={styles.profileEmail}>{email}</p>
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

            <button
              type="button"
              className={styles.dangerMenuItem}
              onClick={() => {
                setWithdrawPassword("");
                setWithdrawError("");
                setIsWithdrawModalOpen(true);
              }}
            >
              <div className={styles.menuItemLeft}>
                <span
                  className={`${styles.menuItemIcon} ${styles.withdrawLabel}`}
                >
                  <UserX size={18} aria-hidden="true" />
                </span>
                <span className={styles.withdrawLabel}>회원탈퇴</span>
              </div>
              <div className={styles.menuItemRight}>
                <ChevronRight size={18} aria-hidden="true" />
              </div>
            </button>
          </div>

          <button
            type="button"
            className={styles.privacyLink}
            onClick={handlePrivacyPolicy}
          >
            개인정보처리방침
          </button>
        </section>
      </main>

      {/* 3. 이름 수정 팝업 */}
      <StandardDialog
        open={isEditNameModalOpen}
        presentation="popup"
        titleId="edit-name-dialog-title"
        descriptionId="edit-name-dialog-description"
        onClose={() => {
          if (isUpdatingName) return;
          setIsEditNameModalOpen(false);
          setEditNameError("");
        }}
        closeDisabled={isUpdatingName}
        tone="primary"
        icon={<Pencil size={27} strokeWidth={2} />}
        title="이름 수정"
        description="서비스에서 사용할 새로운 이름을 입력해주세요."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditNameModalOpen(false);
                setEditNameError("");
              }}
              disabled={isUpdatingName}
            >
              취소
            </Button>
            <Button onClick={handleConfirmUpdateName} disabled={isUpdatingName}>
              {isUpdatingName ? "변경 중..." : "저장"}
            </Button>
          </>
        }
      >
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.nameInput}
            ref={editNameInputRef}
            id="edit-user-name"
            name="userName"
            value={editName}
            placeholder="2~10자 이내 입력"
            maxLength={10}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(event) =>
              handleEditNameChange(event.currentTarget.value)
            }
            onInput={(event) => handleEditNameChange(event.currentTarget.value)}
            disabled={isUpdatingName}
          />
          <div className={styles.inputMetaRow}>
            {editNameError ? (
              <p className={styles.inputErrorText} role="alert">
                {editNameError}
              </p>
            ) : (
              <span />
            )}
            <span
              className={styles.charCounter}
              aria-label={`글자 수 ${editName.length}/10`}
            >
              {editName.length}/10
            </span>
          </div>
        </div>
      </StandardDialog>

      {/* 4. 로그아웃 확인 팝업 */}
      <StandardDialog
        open={isLogoutModalOpen}
        presentation="popup"
        titleId="logout-modal-title"
        descriptionId="logout-modal-description"
        onClose={() => setIsLogoutModalOpen(false)}
        closeDisabled={isLoggingOut}
        icon={<LogOut size={27} strokeWidth={2} />}
        title="로그아웃할까요?"
        description="언제든지 다시 로그인하여 서비스를 이용하실 수 있습니다."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsLogoutModalOpen(false)}
              disabled={isLoggingOut}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </Button>
          </>
        }
      />

      {/* 5. 회원탈퇴 확인 팝업 */}
      <StandardDialog
        open={isWithdrawModalOpen}
        presentation="popup"
        titleId="withdraw-dialog-title"
        descriptionId="withdraw-dialog-description"
        onClose={() => {
          setWithdrawPassword("");
          setWithdrawError("");
          setIsWithdrawModalOpen(false);
        }}
        closeDisabled={isWithdrawing}
        icon={<UserX size={27} strokeWidth={2} />}
        title="정말 탈퇴하시겠습니까?"
        description="회원 탈퇴 시 계정이 비활성화되며 현재 계정으로 다시 로그인할 수 없습니다."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setWithdrawPassword("");
                setWithdrawError("");
                setIsWithdrawModalOpen(false);
              }}
              disabled={isWithdrawing}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? "탈퇴 처리 중..." : "탈퇴하기"}
            </Button>
          </>
        }
      >
        {!isSocialAccount && (
          <div className={styles.inputWrapper}>
            <input
              type="password"
              className={styles.nameInput}
              ref={withdrawPasswordInputRef}
              id="withdraw-password"
              name="password"
              value={withdrawPassword}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(event) =>
                handleWithdrawPasswordChange(event.currentTarget.value)
              }
              onInput={(event) =>
                handleWithdrawPasswordChange(event.currentTarget.value)
              }
              disabled={isWithdrawing}
            />
          </div>
        )}
        {withdrawError && (
          <p className={styles.modalErrorText} role="alert">
            {withdrawError}
          </p>
        )}
      </StandardDialog>

      {/* 6. 성공 토스트 */}
      {toast && <Toast className={styles.toast}>{toast}</Toast>}
    </MobileFrame>
  );
}
