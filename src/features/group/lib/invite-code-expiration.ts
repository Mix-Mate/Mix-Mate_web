const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const INVITE_CODE_VALIDITY_MS = 3 * DAY_IN_MS;
export const INVITE_CODE_REFRESH_INTERVAL_MS = 60 * 1000;

export interface InviteCodeRemainingTime {
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
}

export function calculateInviteCodeRemainingTime(
  createdAt: string,
  nowMs = Date.now(),
): InviteCodeRemainingTime {
  const createdAtDate = new Date(createdAt);
  const expiresAt = new Date(
    createdAtDate.getTime() + INVITE_CODE_VALIDITY_MS,
  );
  const rawRemainingMs = expiresAt.getTime() - nowMs;
  const remainingMs = Number.isFinite(rawRemainingMs)
    ? Math.max(0, rawRemainingMs)
    : 0;

  return {
    remainingMs,
    days: Math.floor(remainingMs / DAY_IN_MS),
    hours: Math.floor((remainingMs / (60 * 60 * 1000)) % 24),
    minutes: Math.floor((remainingMs / (60 * 1000)) % 60),
  };
}

export function formatInviteCodeRemainingTime({
  remainingMs,
  days,
  hours,
  minutes,
}: InviteCodeRemainingTime): string {
  if (remainingMs > 0 && remainingMs < INVITE_CODE_REFRESH_INTERVAL_MS) {
    return "1분 미만";
  }

  return `${days}일 ${hours}시간 ${minutes}분`;
}
