import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "../types/group.types";
import { useGroupStatusNavigation } from "./useGroupStatusNavigation";

const { location, router, query } = vi.hoisted(() => ({
  location: { pathname: "/groups/6/home" },
  router: { replace: vi.fn() },
  query: { data: null as GroupDetail | null },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => location.pathname,
  useRouter: () => router,
}));
vi.mock("./useAdminGroupQuery", () => ({
  useAdminGroupQuery: () => query,
}));

describe("useGroupStatusNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    location.pathname = "/groups/6/home";
    query.data = {
      groupId: 6,
      groupName: "모임",
      description: null,
      status: "VOTING",
      inviteCode: "ABC123",
      createdAt: "2026-08-31",
      memberCount: 8,
      myRole: "PARTICIPANT",
      myParticipantId: 3,
    };
  });

  it.each(["PARTICIPANT", "HOST"] as const)(
    "투표가 시작되면 %s를 MVP 투표 화면으로 한 번 이동시킨다",
    (myRole) => {
      query.data!.myRole = myRole;
      query.data!.status = "FIRST_ROUND";
      const { rerender } = renderHook(() => useGroupStatusNavigation("6"));
      expect(router.replace).not.toHaveBeenCalled();
      query.data = { ...query.data!, status: "VOTING" };
      rerender();
      query.data = { ...query.data! };
      rerender();
      expect(router.replace).toHaveBeenCalledExactlyOnceWith(
        "/groups/6/votes/mvp",
      );
    },
  );

  it.each([
    "/groups/6/votes/mvp",
    "/groups/6/votes/attendance",
    "/groups/6/votes/status",
    "/groups/6/votes/result",
    "/groups/6/admin/votes/status",
    "/groups/6/admin/votes/end",
    "/groups/6/admin/vote-status",
    "/groups/6/extra",
  ])("기존 투표 흐름과 추가 정보 화면을 방해하지 않는다: %s", (pathname) => {
    location.pathname = pathname;
    renderHook(() => useGroupStatusNavigation("6"));
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("투표 화면에서 다른 그룹 화면으로 나와도 현재 상태를 따른다", () => {
    location.pathname = "/groups/6/votes/attendance";
    const { rerender } = renderHook(() => useGroupStatusNavigation("6"));
    location.pathname = "/groups/6/team";
    rerender();
    expect(router.replace).toHaveBeenCalledExactlyOnceWith(
      "/groups/6/votes/mvp",
    );
  });

  it("관리자가 투표 완료 후 현황 화면에 있으면 MVP 투표로 되돌리지 않는다", () => {
    query.data!.myRole = "HOST";
    location.pathname = "/groups/6/admin/votes/status";
    const { rerender } = renderHook(() => useGroupStatusNavigation("6"));
    query.data = { ...query.data! };
    rerender();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
