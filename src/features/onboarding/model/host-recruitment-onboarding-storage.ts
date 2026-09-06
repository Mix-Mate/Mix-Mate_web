/**
 * 모집 중 화면 온보딩은 서버에 남길 필요가 없는 UI 상태라 localStorage에 둔다.
 * 키 형태는 다른 저장소 모듈(mixmate:admin-participant-drafts: 등)과 맞춘다.
 */
export const HOST_RECRUITMENT_ONBOARDING_STORAGE_KEY =
  "mixmate:host-recruitment-onboarding-completed";

/** 완료와 건너뛰기를 구분하지 않고 "확인한 상태" 하나로 저장한다. */
const SEEN_VALUE = "true";

const listeners = new Set<() => void>();

export function subscribeHostRecruitmentOnboardingSeen(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function hasSeenHostRecruitmentOnboarding(): boolean {
  try {
    return (
      window.localStorage.getItem(HOST_RECRUITMENT_ONBOARDING_STORAGE_KEY) ===
      SEEN_VALUE
    );
  } catch {
    // 프라이빗 모드 등으로 접근이 막히면 반복 노출이 더 성가시므로 노출하지 않는다.
    return true;
  }
}

/**
 * 서버 렌더 시점에는 localStorage를 읽을 수 없으므로 "본 것"으로 취급한다.
 * 하이드레이션 이후 실제 값으로 다시 판단하므로 깜빡임 없이 온보딩이 열린다.
 */
export function hasSeenHostRecruitmentOnboardingOnServer(): boolean {
  return true;
}

export function rememberHostRecruitmentOnboardingSeen() {
  try {
    window.localStorage.setItem(
      HOST_RECRUITMENT_ONBOARDING_STORAGE_KEY,
      SEEN_VALUE,
    );
  } catch {
    // 저장에 실패해도 이번 세션의 온보딩 종료는 그대로 진행한다.
  }

  listeners.forEach((listener) => listener());
}
