import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVoteNavigation } from "./useVoteNavigation";

const router = vi.hoisted(() => ({
  replace: vi.fn(),
  back: vi.fn(),
  push: vi.fn(),
}));
const historyPosition = vi.hoisted(() => ({
  value: undefined as number | undefined,
}));
vi.mock("@/shared/lib/navigation/history-position", () => ({
  getHistoryPosition: () => historyPosition.value,
}));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

describe("투표 뒤로가기", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    historyPosition.value = undefined;
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("가짜 히스토리를 추가하거나 forward로 사용자를 가두지 않고 명시한 경로로 교체한다", () => {
    const push = vi.spyOn(history, "pushState");
    const forward = vi.spyOn(history, "forward");
    historyPosition.value = 2;
    renderHook(() => useVoteNavigation("/home"));
    historyPosition.value = 1;
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(router.replace).toHaveBeenCalledExactlyOnceWith("/home");
    expect(push).not.toHaveBeenCalled();
    expect(forward).not.toHaveBeenCalled();
    expect(router.back).not.toHaveBeenCalled();
  });

  it("기록되지 않은 히스토리에서는 기본 탐색을 방해하지 않고 헤더만 명시적으로 이동한다", () => {
    const { result } = renderHook(() => useVoteNavigation("/home"));
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(router.replace).not.toHaveBeenCalled();
    act(() => result.current.back());
    expect(router.replace).toHaveBeenCalledExactlyOnceWith("/home");
  });

  it("앞으로가기는 가로채지 않는다", () => {
    historyPosition.value = 2;
    renderHook(() => useVoteNavigation("/home"));
    historyPosition.value = 3;
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("이동 또는 언마운트 뒤 늦게 도착한 제출 응답이 경로를 덮어쓰지 않는다", () => {
    const { result, unmount } = renderHook(() => useVoteNavigation("/home"));
    const replace = result.current.replace;
    act(() => result.current.back());
    act(() => replace("/groups/7/votes/attendance"));
    unmount();
    act(() => replace("/groups/7/votes/mvp"));
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(router.replace).toHaveBeenCalledExactlyOnceWith("/home");
  });
});
