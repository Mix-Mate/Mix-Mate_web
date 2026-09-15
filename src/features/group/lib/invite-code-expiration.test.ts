import { describe, expect, it } from "vitest";
import {
  calculateInviteCodeRemainingTime,
  INVITE_CODE_VALIDITY_MS,
} from "./invite-code-expiration";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

describe("invite code expiration", () => {
  it("발급 시점부터 7일을 유효 기간으로 계산한다", () => {
    const createdAt = "2026-09-15T00:00:00.000Z";
    const createdAtMs = new Date(createdAt).getTime();

    expect(INVITE_CODE_VALIDITY_MS).toBe(7 * DAY_IN_MS);
    expect(calculateInviteCodeRemainingTime(createdAt, createdAtMs)).toEqual({
      remainingMs: 7 * DAY_IN_MS,
      days: 7,
      hours: 0,
      minutes: 0,
    });
  });

  it("7일이 지나면 남은 시간을 0으로 고정한다", () => {
    const createdAt = "2026-09-15T00:00:00.000Z";
    const afterExpiration = new Date(createdAt).getTime() + 8 * DAY_IN_MS;

    expect(
      calculateInviteCodeRemainingTime(createdAt, afterExpiration),
    ).toEqual({
      remainingMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
    });
  });

  it("서버 만료 시각이 있으면 그룹 생성 시각보다 우선한다", () => {
    const createdAt = "2026-09-01T00:00:00.000Z";
    const now = new Date("2026-09-15T00:00:00.000Z").getTime();
    const expiresAt = "2026-09-22T00:00:00.000Z";

    expect(calculateInviteCodeRemainingTime(createdAt, now, expiresAt)).toEqual(
      {
        remainingMs: 7 * DAY_IN_MS,
        days: 7,
        hours: 0,
        minutes: 0,
      },
    );
  });
});
