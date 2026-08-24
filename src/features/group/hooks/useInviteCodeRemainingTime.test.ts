import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { INVITE_CODE_REFRESH_INTERVAL_MS } from "../lib/invite-code-expiration";
import { useInviteCodeRemainingTime } from "./useInviteCodeRemainingTime";

describe("useInviteCodeRemainingTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates immediately, refreshes every minute, and clears its interval", () => {
    vi.useFakeTimers();
    const createdAt = "2026-08-23T23:53:47.452Z";
    const initialNowMs = new Date(createdAt).getTime();
    vi.setSystemTime(initialNowMs);

    const { result, unmount } = renderHook(() =>
      useInviteCodeRemainingTime(createdAt),
    );

    expect(result.current).toMatchObject({
      days: 3,
      hours: 0,
      minutes: 0,
    });
    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      vi.advanceTimersByTime(INVITE_CODE_REFRESH_INTERVAL_MS);
    });

    expect(result.current).toMatchObject({
      days: 2,
      hours: 23,
      minutes: 59,
    });

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
