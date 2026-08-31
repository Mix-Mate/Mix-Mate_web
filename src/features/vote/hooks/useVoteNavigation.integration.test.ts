import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getHistoryPosition,
  trackHistoryPositions,
} from "@/shared/lib/navigation/history-position";
import { useVoteNavigation } from "./useVoteNavigation";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

let stop: () => void;
describe("실제 History API와 투표 뒤로가기 연동", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    history.replaceState({ __NA: true }, "", "/home");
    stop = trackHistoryPositions();
  });
  afterEach(() => {
    cleanup();
    stop();
  });

  it("이전 그룹 홈이 남아 있어도 Next 복원보다 먼저 서비스 홈으로 이동한다", async () => {
    history.pushState({ __NA: true }, "", "/groups/7");
    history.pushState({ __NA: true }, "", "/groups/7/votes/mvp");
    const length = history.length;
    const restoreOldGroup = vi.fn();
    window.addEventListener("popstate", restoreOldGroup);
    try {
      renderHook(() => useVoteNavigation("/home"));
      act(() => history.back());
      await waitFor(() =>
        expect(router.replace).toHaveBeenCalledExactlyOnceWith("/home"),
      );
      expect(restoreOldGroup).not.toHaveBeenCalled();
      expect(history.length).toBe(length);
    } finally {
      window.removeEventListener("popstate", restoreOldGroup);
    }
  });

  it("실제 앞으로가기는 가로채지 않는다", async () => {
    history.pushState({ __NA: true }, "", "/groups/7/votes/mvp");
    history.pushState({ __NA: true }, "", "/groups/7/votes/attendance");
    act(() => history.back());
    await waitFor(() => expect(getHistoryPosition()).toBe(1));
    renderHook(() => useVoteNavigation("/home"));
    act(() => history.forward());
    await waitFor(() => expect(getHistoryPosition()).toBe(2));
    expect(router.replace).not.toHaveBeenCalled();
  });
});
