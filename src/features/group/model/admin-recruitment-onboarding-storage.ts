const ADMIN_RECRUITMENT_ONBOARDING_STORAGE_PREFIX =
  "mixmate:admin-recruitment-onboarding:v1:";
const COMPLETED_VALUE = "completed";
const FALLBACK_USER_ID = "anonymous";

function getCurrentUserId() {
  if (typeof window === "undefined") return FALLBACK_USER_ID;

  try {
    return window.localStorage.getItem("userId")?.trim() || FALLBACK_USER_ID;
  } catch {
    return FALLBACK_USER_ID;
  }
}

export function getAdminRecruitmentOnboardingStorageKey() {
  return `${ADMIN_RECRUITMENT_ONBOARDING_STORAGE_PREFIX}${getCurrentUserId()}`;
}

export function hasCompletedAdminRecruitmentOnboarding() {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.localStorage.getItem(
        getAdminRecruitmentOnboardingStorageKey(),
      ) === COMPLETED_VALUE
    );
  } catch {
    return false;
  }
}

export function completeAdminRecruitmentOnboarding() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      getAdminRecruitmentOnboardingStorageKey(),
      COMPLETED_VALUE,
    );
  } catch {
    // 스토리지가 차단된 환경에서도 온보딩 종료 자체는 정상 동작한다.
  }
}

export function resetAdminRecruitmentOnboarding() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(
      getAdminRecruitmentOnboardingStorageKey(),
    );
  } catch {
    // 테스트용 초기화는 스토리지를 사용할 수 없는 환경에서 무시한다.
  }
}
