"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import {
  hasSeenHostRecruitmentOnboarding,
  hasSeenHostRecruitmentOnboardingOnServer,
  rememberHostRecruitmentOnboardingSeen,
  subscribeHostRecruitmentOnboardingSeen,
} from "../model/host-recruitment-onboarding-storage";

interface HostRecruitmentOnboarding {
  open: boolean;
  /** 완료·건너뛰기 공통 처리: 다시 자동으로 뜨지 않도록 기록하고 닫는다. */
  dismiss: () => void;
}

/**
 * HOST가 모집 중 화면에 처음 들어왔을 때만 온보딩을 연다.
 * 한 번 확인하면 localStorage에 남아 재진입/새로고침에도 다시 열리지 않는다.
 */
export function useHostRecruitmentOnboarding(
  enabled: boolean,
): HostRecruitmentOnboarding {
  const seen = useSyncExternalStore(
    subscribeHostRecruitmentOnboardingSeen,
    hasSeenHostRecruitmentOnboarding,
    hasSeenHostRecruitmentOnboardingOnServer,
  );
  // 저장이 막힌 환경(프라이빗 모드, 용량 초과)에서도 이번 화면에서는 확실히 닫히게 한다.
  const [dismissed, setDismissed] = useState(false);

  const dismiss = useCallback(() => {
    rememberHostRecruitmentOnboardingSeen();
    setDismissed(true);
  }, []);

  return { open: enabled && !seen && !dismissed, dismiss };
}
