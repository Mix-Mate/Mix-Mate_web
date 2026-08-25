"use client";

import { useEffect, useState } from "react";
import {
  calculateInviteCodeRemainingTime,
  INVITE_CODE_REFRESH_INTERVAL_MS,
  type InviteCodeRemainingTime,
} from "../lib/invite-code-expiration";

export function useInviteCodeRemainingTime(
  createdAt: string,
): InviteCodeRemainingTime {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, INVITE_CODE_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return calculateInviteCodeRemainingTime(createdAt, nowMs);
}
