"use client";

import { useEffect, useRef, useState } from "react";
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
import { clearAuthTokens } from "@/shared/api/authToken";
import {
  getMyPageUserProfileApi,
  UserApiError,
  type MyPageUserProfile,
  updateUserNameApi,
  validateUserName,
} from "@/features/user/api/user.api";
import MvpMedalPopover from "@/features/profile/components/MvpMedalPopover";
import styles from "./MyPageScreen.module.css";

type MyPageProfile = Pick<
  MyPageUserProfile,
  "email" | "provider" | "userName" | "mvpCount"
>;

type NormalizedProvider = "local" | "kakao" | "google" | "social";

function normalizeProvider(provider?: string | null): NormalizedProvider {
  const rawProvider = provider?.trim();
  const lowerProvider = rawProvider?.toLowerCase();

  if (!rawProvider || lowerProvider === "local" || rawProvider === "로컬") {
    return "local";
  }
  if (lowerProvider === "kakao" || rawProvider === "카카오") {
    return "kakao";
  }
  if (lowerProvider === "google" || rawProvider === "구글") {
    return "google";
  }

  return "social";
}

function getProviderLabel(provider: NormalizedProvider) {
  switch (provider) {
    case "kakao":
      return "카카오";
    case "google":
      return "구글";
    case "social":
      return "소셜";
    case "local":
    default:
      return "로컬";
  }
}

const defaultProfile: MyPageProfile = {
  userName: "사용자",
  email: "user@mixmate.kr",
  provider: "local",
  mvpCount: 0,
};

function getStoredProfile(): MyPageProfile {
  if (typeof window === "undefined") return defaultProfile;

  return {
    userName:
      window.localStorage.getItem("userName") ||
      window.localStorage.getItem("displayName") ||
      defaultProfile.userName,
    email: window.localStorage.getItem("email") || defaultProfile.email,
    provider: normalizeProvider(
      window.localStorage.getItem("provider") || defaultProfile.provider,
    ),
    mvpCount: defaultProfile.mvpCount,
  };
}

function rememberProfile(profile: Partial<MyPageUserProfile>) {
  if (typeof window === "undefined") return;

  if (profile.userId) {
    window.localStorage.setItem("userId", String(profile.userId));
  }
  if (profile.userName) {
    window.localStorage.setItem("userName", profile.userName);
  }
  if (profile.email) {
    window.localStorage.setItem("email", profile.email);
  }
  if (profile.provider) {
    window.localStorage.setItem("provider", normalizeProvider(profile.provider));
  }

  window.dispatchEvent(new Event("storage"));
}

function getUpdatedUserName(
  response: Awaited<ReturnType<typeof updateUserNameApi>>,
  fallback: string,
) {
  if (typeof response === "object" && response?.userName) {
    return response.userName;
  }
  return fallback;
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
  const [profile, setProfile] = useState<MyPageProfile>(defaultProfile);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const normalizedProvider = normalizeProvider(profile.provider);
  const isSocialAccount = normalizedProvider !== "local";
  const providerLabel = getProviderLabel(normalizedProvider);
  const withdrawDescription = isSocialAccount
    ? `${providerLabel} 로그인 계정은 비밀번호 확인 없이 탈퇴가 진행됩니다. 탈퇴 후 현재 계정으로 다시 로그인할 수 없습니다.`
    : "회원 탈퇴를 위해 비밀번호를 입력해주세요. 탈퇴 후 현재 계정으로 다시 로그인할 수 없습니다.";

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

  useEffect(() => {
    let ignore = false;

    async function fetchMyPageProfile() {
      setIsProfileLoading(true);
      setProfileError("");

      try {
        setProfile(getStoredProfile());
        const nextProfile = await getMyPageUserProfileApi();
        if (ignore) return;

        setProfile({
          userName: nextProfile.userName,
          email: nextProfile.email || defaultProfile.email,
          provider: normalizeProvider(nextProfile.provider),
          mvpCount: nextProfile.mvpCount,
        });
        rememberProfile(nextProfile);
      } catch (error) {
        if (ignore) return;

        if (error instanceof UserApiError && error.status === 401) {
          clearAuthTokens();
          router.replace(authRoutes.login());
          return;
        }

        setProfileError(
          error instanceof Error
            ? error.message
            : "계정 정보를 불러오지 못했습니다.",
        );
      } finally {
        if (!ignore) setIsProfileLoading(false);
      }
    }

    void fetchMyPageProfile();

    return () => {
      ignore = true;
    };
  }, [router]);

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
    setEditName(profile.userName);
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
      const response = await updateUserNameApi(trimmed);
      const nextUserName = getUpdatedUserName(response, trimmed);
      setProfile((current) => ({ ...current, userName: nextUserName }));
      rememberProfile({ userName: nextUserName });
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
            name={profile.userName}
            size={60}
            className={styles.profileAvatar}
          />

          <div className={styles.profileInfo}>
            <div className={styles.profileNameRow}>
              <h2 className={styles.profileName}>{profile.userName}</h2>
              <button
                type="button"
                className={styles.editNameButton}
                onClick={handleOpenEditNameModal}
                aria-label="이름 수정"
                disabled={isProfileLoading}
              >
                <Pencil size={12} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </div>
            <p className={styles.profileEmail}>{profile.email}</p>
            {(isProfileLoading || profileError) && (
              <p
                className={
                  profileError
                    ? styles.profileErrorText
                    : styles.profileStatusText
                }
                role={profileError ? "alert" : undefined}
              >
                {profileError || "계정 정보를 불러오는 중..."}
              </p>
            )}
          </div>

          <MvpMedalPopover mvpCount={profile.mvpCount} />
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
        description={withdrawDescription}
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
