import {
  calculateInviteCodeRemainingTime,
  formatInviteCodeRemainingTime,
  INVITE_CODE_VALIDITY_MS,
} from "./invite-code-expiration";

describe("invite code expiration", () => {
  const createdAt = "2026-08-23T23:53:47.452Z";
  const createdAtMs = new Date(createdAt).getTime();

  it("calculates the expiration from the server-created time plus three days", () => {
    const nowMs = createdAtMs + (9 * 60 * 60 + 27 * 60) * 1000;

    expect(calculateInviteCodeRemainingTime(createdAt, nowMs)).toEqual({
      remainingMs: INVITE_CODE_VALIDITY_MS - (9 * 60 * 60 + 27 * 60) * 1000,
      days: 2,
      hours: 14,
      minutes: 33,
    });
  });

  it("formats a positive duration without seconds", () => {
    const remainingTime = calculateInviteCodeRemainingTime(
      createdAt,
      createdAtMs + (9 * 60 * 60 + 28 * 60) * 1000,
    );

    expect(formatInviteCodeRemainingTime(remainingTime)).toBe(
      "2일 14시간 32분",
    );
  });

  it("formats a positive duration under one minute as less than one minute", () => {
    const remainingTime = calculateInviteCodeRemainingTime(
      createdAt,
      createdAtMs + INVITE_CODE_VALIDITY_MS - 30 * 1000,
    );

    expect(formatInviteCodeRemainingTime(remainingTime)).toBe("1분 미만");
  });

  it("clamps an expired duration to zero", () => {
    const remainingTime = calculateInviteCodeRemainingTime(
      createdAt,
      createdAtMs + INVITE_CODE_VALIDITY_MS + 1000,
    );

    expect(remainingTime).toEqual({
      remainingMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
    });
  });
});
