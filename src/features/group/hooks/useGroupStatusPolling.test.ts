import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail, GroupStatus } from "../types/group.types";
import { useGroupStatusPolling } from "./useGroupStatusPolling";

const { pathnameMock, refetchMock, replaceMock, useAdminGroupQueryMock } =
  vi.hoisted(() => ({
    pathnameMock: vi.fn(),
    refetchMock: vi.fn(),
    replaceMock: vi.fn(),
    useAdminGroupQueryMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  usePathname: pathnameMock,
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("./useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

function createGroup(status: GroupStatus): GroupDetail {
  return {
    groupId: 6,
    groupName: "API 그룹",
    description: null,
    status,
    inviteCode: "ABC123",
    createdAt: "2026-08-27T00:00:00.000Z",
    memberCount: 8,
    myRole: "PARTICIPANT",
    myParticipantId: 3,
  };
}

function mockGroupQuery(data: GroupDetail | null) {
  useAdminGroupQueryMock.mockReturnValue({
    data,
    refetch: refetchMock,
  });
}

describe("useGroupStatusPolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    pathnameMock.mockReturnValue("/groups/6/home");
    refetchMock.mockResolvedValue(createGroup("FIRST_ROUND"));
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("최초 조회 상태가 VOTING이면 즉시 MVP 투표 화면으로 이동한다", () => {
    mockGroupQuery(createGroup("VOTING"));

    renderHook(() => useGroupStatusPolling("6"));

    expect(replaceMock).toHaveBeenCalledOnce();
    expect(replaceMock).toHaveBeenCalledWith("/groups/6/votes/mvp");
    expect(refetchMock).not.toHaveBeenCalled();
  });

  it("2초 polling에서 VOTING을 감지하면 MVP 투표 화면으로 이동한다", async () => {
    mockGroupQuery(createGroup("FIRST_ROUND"));
    refetchMock.mockResolvedValue(createGroup("VOTING"));

    renderHook(() => useGroupStatusPolling("6"));

    await act(() => vi.advanceTimersByTimeAsync(2_000));

    expect(refetchMock).toHaveBeenCalledOnce();
    expect(replaceMock).toHaveBeenCalledWith("/groups/6/votes/mvp");
  });

  it("이동 중 상태가 갱신되어도 동일한 경로로 다시 이동하지 않는다", async () => {
    let group = createGroup("FIRST_ROUND");
    useAdminGroupQueryMock.mockImplementation(() => ({
      data: group,
      refetch: refetchMock,
    }));
    refetchMock.mockResolvedValue(createGroup("VOTING"));

    const { rerender } = renderHook(() => useGroupStatusPolling("6"));

    await act(() => vi.advanceTimersByTimeAsync(2_000));
    group = createGroup("VOTING");
    rerender();

    expect(replaceMock).toHaveBeenCalledOnce();
  });

  it("기존 그룹 데이터가 없으면 진입 즉시 상태를 조회한다", async () => {
    mockGroupQuery(null);
    refetchMock.mockResolvedValue(createGroup("VOTING"));

    renderHook(() => useGroupStatusPolling("6"));

    await act(async () => Promise.resolve());

    expect(refetchMock).toHaveBeenCalledOnce();
    expect(replaceMock).toHaveBeenCalledWith("/groups/6/votes/mvp");
  });

  it.each([
    "/groups/6/votes/mvp",
    "/groups/6/votes/attendance",
    "/groups/6/votes/status",
    "/groups/6/admin/votes/end",
  ])("투표 흐름에서는 polling과 이동을 반복하지 않는다: %s", async (pathname) => {
    pathnameMock.mockReturnValue(pathname);
    mockGroupQuery(createGroup("VOTING"));

    renderHook(() => useGroupStatusPolling("6"));

    await act(() => vi.advanceTimersByTimeAsync(4_000));

    expect(refetchMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("unmount 시 polling interval을 정리한다", async () => {
    mockGroupQuery(createGroup("FIRST_ROUND"));

    const { unmount } = renderHook(() => useGroupStatusPolling("6"));
    unmount();

    await act(() => vi.advanceTimersByTimeAsync(4_000));

    expect(refetchMock).not.toHaveBeenCalled();
  });

  it("상태 조회 실패 시 현재 화면을 유지한다", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockGroupQuery(createGroup("FIRST_ROUND"));
    refetchMock.mockResolvedValue(null);

    renderHook(() => useGroupStatusPolling("6"));

    await act(() => vi.advanceTimersByTimeAsync(2_000));

    expect(replaceMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "그룹 상태 polling에 실패했습니다.",
    );

    consoleError.mockRestore();
  });
});
