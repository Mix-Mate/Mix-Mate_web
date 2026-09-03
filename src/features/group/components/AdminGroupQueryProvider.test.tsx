import { StrictMode, useEffect } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthTokens, setAuthTokens } from "@/shared/api/authToken";
import UserHomeScreen from "@/screens/user/UserHomeScreen";
import AdminHomeScreen from "@/screens/admin/AdminHomeScreen";
import VoteStatusScreen from "@/screens/common/VoteStatusScreen";
import { useAdminGroupQuery } from "../hooks/useAdminGroupQuery";
import type { GroupDetail, GroupStatus } from "../types/group.types";
import {
  GroupStatusStreamError,
  type GroupStatusStreamOptions,
} from "../api/groupStatusStream.api";
import AdminGroupQueryProvider from "./AdminGroupQueryProvider";
import GroupStatusNavigationBoundary from "./GroupStatusNavigationBoundary";

const { route, router, getGroupDetail, subscribe, getMyTeam } = vi.hoisted(
  () => ({
    route: { groupId: "6", pathname: "/groups/6" },
    router: { replace: vi.fn(), push: vi.fn(), back: vi.fn() },
    getGroupDetail: vi.fn(),
    subscribe: vi.fn(),
    getMyTeam: vi.fn(),
  }),
);

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: route.groupId }),
  usePathname: () => route.pathname,
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("../api/group.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/group.api")>()),
  getGroupDetail,
}));
vi.mock("../api/groupStatusStream.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/groupStatusStream.api")>()),
  subscribeGroupStatus: subscribe,
}));
vi.mock("@/features/team/api/team.api", () => ({ getMyTeam }));
vi.mock("@/features/vote/hooks/useVoteStatusQuery", () => ({
  useVoteStatusQuery: () => ({
    data: {
      totalParticipantCount: 8,
      votedCount: 1,
      participateCount: 1,
      notParticipateCount: 0,
      participants: [
        { participantId: 3, choice: "PARTICIPATE", displayName: "참가자" },
      ],
    },
    isLoading: false,
    isComplete: false,
    error: null,
  }),
}));

function group(status: GroupStatus = "RECRUITING", groupId = 6): GroupDetail {
  return {
    groupId,
    status,
    groupName: "SSE 모임",
    description: null,
    inviteCode: "ABC123",
    createdAt: "2026-08-31",
    memberCount: 8,
    myRole: "PARTICIPANT",
    myParticipantId: 3,
  };
}

let subscriptions: {
  groupId: string;
  options: GroupStatusStreamOptions;
  stop: ReturnType<typeof vi.fn>;
}[];
let query: ReturnType<typeof useAdminGroupQuery>;

function Probe() {
  const currentQuery = useAdminGroupQuery(route.groupId);
  useEffect(() => {
    query = currentQuery;
  }, [currentQuery]);
  return (
    <output data-testid="group-state">
      {JSON.stringify(currentQuery.data)}
    </output>
  );
}

function App({
  home = false,
  adminHome = false,
  vote = false,
}: {
  home?: boolean;
  adminHome?: boolean;
  vote?: boolean;
}) {
  return (
    <AdminGroupQueryProvider>
      <GroupStatusNavigationBoundary>
        <Probe />
        {home && <UserHomeScreen />}
        {adminHome && <AdminHomeScreen />}
        {vote && <VoteStatusScreen />}
      </GroupStatusNavigationBoundary>
    </AdminGroupQueryProvider>
  );
}

async function emit(status: GroupStatus) {
  await waitFor(() => expect(subscriptions.length).toBeGreaterThan(0));
  await act(async () => {
    const subscription = subscriptions.at(-1)!;
    subscription.options.onStatus({
      groupId: Number(subscription.groupId),
      status,
    });
  });
}

describe("공통 그룹 SSE 동기화", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscriptions = [];
    route.groupId = "6";
    route.pathname = "/groups/6";
    setAuthTokens({ accessToken: "test-token" });
    getGroupDetail.mockImplementation(async (id: string) =>
      group("RECRUITING", Number(id)),
    );
    getMyTeam.mockResolvedValue({
      round: "FIRST_ROUND",
      team: { teamNumber: 1, members: [] },
    });
    subscribe.mockImplementation(
      (groupId: string, options: GroupStatusStreamOptions) => {
        const stop = vi.fn();
        subscriptions.push({ groupId, options, stop });
        return stop;
      },
    );
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  it("모집·1차 대기·진행·2차 대기·진행 상태와 내 조 표시를 새로고침 없이 갱신한다", async () => {
    render(<App home />);
    expect(await screen.findByTestId("user-home")).toHaveAttribute(
      "data-status",
      "RECRUITING",
    );
    expect(getMyTeam).not.toHaveBeenCalled();
    await emit("BEFORE_FIRST_ROUND");
    expect(screen.getByTestId("user-home")).toHaveAttribute(
      "data-status",
      "BEFORE_FIRST_ROUND",
    );
    expect(getMyTeam).not.toHaveBeenCalled();
    await emit("FIRST_ROUND");
    expect(
      await screen.findByRole("button", { name: /배정 결과 확인하기/ }),
    ).toBeVisible();
    expect(getMyTeam).toHaveBeenCalledWith(
      "6",
      "FIRST_ROUND",
      expect.any(AbortSignal),
    );
    await emit("BEFORE_SECOND_ROUND");
    expect(screen.getByTestId("user-home")).toHaveAttribute(
      "data-status",
      "BEFORE_SECOND_ROUND",
    );
    expect(screen.getByText("아직 자리 배치 전입니다")).toBeVisible();
    await emit("SECOND_ROUND");
    expect(getMyTeam).toHaveBeenLastCalledWith(
      "6",
      "SECOND_ROUND",
      expect.any(AbortSignal),
    );
    await emit("FINISHED");
    expect(router.replace).toHaveBeenCalledWith("/groups/6/completed");
    expect(subscribe).toHaveBeenCalledOnce();
    expect(getGroupDetail).toHaveBeenCalledOnce();
  });

  it("화면이 투표 현황으로 바뀌어도 구독을 유지하고 투표 종료 이벤트로 결과 화면에 이동한다", async () => {
    getGroupDetail.mockResolvedValue(group("FIRST_ROUND"));
    const { rerender } = render(<App />);
    await screen.findByTestId("group-state");
    await emit("VOTING");
    expect(router.replace).toHaveBeenCalledWith("/groups/6/votes/mvp");
    router.replace.mockClear();
    route.pathname = "/groups/6/votes/status";
    rerender(<App vote />);
    expect(subscribe).toHaveBeenCalledOnce();
    await emit("VOTE_CLOSED");
    expect(router.replace).toHaveBeenCalledWith("/groups/6/votes/result");
    expect(subscriptions[0].stop).not.toHaveBeenCalled();
  });

  it.each(["/groups/6", "/groups/6/admin"])(
    "관리자도 %s에서 투표 시작 이벤트를 받으면 MVP 투표로 한 번만 이동한다",
    async (pathname) => {
      route.pathname = pathname;
      getGroupDetail.mockResolvedValue({
        ...group("FIRST_ROUND"),
        myRole: "HOST",
      });
      render(
        <App
          home={pathname === "/groups/6"}
          adminHome={pathname.endsWith("/admin")}
        />,
      );
      await screen.findByTestId("group-state");
      await emit("VOTING");
      await emit("VOTING");
      expect(router.replace).toHaveBeenCalledExactlyOnceWith(
        "/groups/6/votes/mvp",
      );
      expect(subscribe).toHaveBeenCalledOnce();
      expect(subscriptions[0].stop).not.toHaveBeenCalled();
    },
  );

  it.each(
    ["/groups/6", "/groups/6/admin"].flatMap((pathname) =>
      (["FIRST_ROUND", "SECOND_ROUND", "VOTING", "VOTE_CLOSED"] as const).map(
        (status) => ({ pathname, status }),
      ),
    ),
  )(
    "$status 상태로 $pathname에 진입하면 진행 현황 대신 그룹 홈을 보여준다",
    async ({ pathname, status }) => {
      route.pathname = pathname;
      getGroupDetail.mockResolvedValue({ ...group(status), myRole: "HOST" });
      render(
        <App
          home={pathname === "/groups/6"}
          adminHome={pathname.endsWith("/admin")}
        />,
      );

      await screen.findByTestId("user-home");
      expect(screen.queryByTestId("admin-progress")).not.toBeInTheDocument();
      expect(router.replace).not.toHaveBeenCalled();
    },
  );

  it("REST 응답과 반환값 모두 요청 중 받은 SSE 상태를 유지하고 다른 필드는 갱신한다", async () => {
    render(<App />);
    await screen.findByTestId("group-state");
    let resolve!: (value: GroupDetail) => void;
    getGroupDetail.mockReturnValueOnce(
      new Promise<GroupDetail>((done) => {
        resolve = done;
      }),
    );
    let pending!: Promise<GroupDetail | null>;
    act(() => {
      pending = query.refetch();
    });
    await emit("FIRST_ROUND");
    await act(async () => {
      resolve({ ...group(), memberCount: 12 });
      expect(await pending).toMatchObject({
        status: "FIRST_ROUND",
        memberCount: 12,
      });
    });
    expect(query.data).toMatchObject({
      status: "FIRST_ROUND",
      memberCount: 12,
      myRole: "PARTICIPANT",
      myParticipantId: 3,
    });
  });

  it("SSE 이후 시작한 명시적 REST 재조회는 새 상태를 반영할 수 있다", async () => {
    render(<App />);
    await screen.findByTestId("group-state");
    await emit("BEFORE_FIRST_ROUND");
    getGroupDetail.mockResolvedValueOnce(group("FIRST_ROUND"));
    await act(async () => {
      await query.refetch();
    });
    expect(query.data?.status).toBe("FIRST_ROUND");
  });

  it("상태가 그대로이면 REST 폴링이나 SSE 재구독을 하지 않는다", async () => {
    render(<App />);
    await screen.findByTestId("group-state");
    await emit("RECRUITING");
    vi.useFakeTimers();
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(getGroupDetail).toHaveBeenCalledOnce();
    expect(subscribe).toHaveBeenCalledOnce();
  });

  it("그룹 변경과 언마운트 시 연결을 정리하고 이전 REST 응답을 무시한다", async () => {
    const { rerender, unmount } = render(<App />);
    await screen.findByTestId("group-state");
    let resolve!: (value: GroupDetail) => void;
    getGroupDetail.mockReturnValueOnce(
      new Promise<GroupDetail>((done) => {
        resolve = done;
      }),
    );
    act(() => {
      void query.refetch();
    });
    route.groupId = "7";
    route.pathname = "/groups/7/home";
    rerender(<App />);
    await waitFor(() => expect(query.data?.groupId).toBe(7));
    expect(subscriptions[0].stop).toHaveBeenCalledOnce();
    await act(async () => {
      resolve(group("VOTING"));
    });
    expect(query.data?.groupId).toBe(7);
    expect(router.replace).not.toHaveBeenCalledWith("/groups/6/votes/mvp");
    unmount();
    expect(subscriptions[1].stop).toHaveBeenCalledOnce();
  });

  it("추가 정보 입력 화면에서는 구독하지 않는다", () => {
    route.pathname = "/groups/6/extra";
    render(<App />);
    expect(subscribe).not.toHaveBeenCalled();
    expect(getGroupDetail).not.toHaveBeenCalled();
  });

  it.each([
    ["/groups/6/votes/mvp", "/home"],
    ["/groups/6/votes/attendance", "/groups/6/votes/mvp"],
  ])(
    "%s 새로고침 중에도 헤더 뒤로가기는 히스토리에 의존하지 않는다",
    (pathname, target) => {
      route.pathname = pathname;
      getGroupDetail.mockReturnValue(new Promise(() => {}));
      render(<App />);
      fireEvent.click(
        screen.getByRole("button", { name: "이전 화면으로 이동" }),
      );
      if (target === "/home") {
        expect(router.replace).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole("button", { name: "나가기" }));
      }
      expect(router.replace).toHaveBeenCalledExactlyOnceWith(target);
      expect(router.back).not.toHaveBeenCalled();
    },
  );

  it.each(
    [
      "/groups/6",
      "/groups/6/admin",
      "/groups/6/admin/recruitment",
      "/groups/6/admin/preparation",
    ].flatMap((pathname) =>
      ["loading", "error"].map((state) => ({ pathname, state })),
    ),
  )(
    "$pathname의 $state 화면에서도 확인 후 메인 홈으로 나간다",
    async ({ pathname, state }) => {
      route.pathname = pathname;
      if (state === "error") {
        getGroupDetail.mockRejectedValue(new Error("그룹 조회 실패"));
      } else {
        getGroupDetail.mockReturnValue(new Promise(() => {}));
      }
      render(<App />);
      if (state === "error") await screen.findByRole("alert");

      fireEvent.click(
        screen.getByRole("button", { name: "이전 화면으로 이동" }),
      );
      expect(
        screen.getByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
      ).toBeInTheDocument();
      expect(router.replace).not.toHaveBeenCalled();
      expect(router.back).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "나가기" }));
      expect(router.replace).toHaveBeenCalledExactlyOnceWith("/home");
    },
  );

  it("같은 탭에서 로그아웃하면 즉시 구독을 정리한다", async () => {
    render(<App />);
    await screen.findByTestId("group-state");
    await waitFor(() => expect(subscribe).toHaveBeenCalled());
    act(() => clearAuthTokens());
    expect(subscriptions[0].stop).toHaveBeenCalledOnce();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("다른 탭의 로그아웃도 감지한다", async () => {
    render(<App />);
    await screen.findByTestId("group-state");
    await waitFor(() => expect(subscribe).toHaveBeenCalled());
    act(() => {
      localStorage.removeItem("accessToken");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "accessToken", newValue: null }),
      );
    });
    expect(subscriptions[0].stop).toHaveBeenCalledOnce();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("401 수신 시 인증을 정리하고 로그인 화면으로 이동한다", async () => {
    render(<App />);
    await screen.findByTestId("group-state");
    await waitFor(() => expect(subscribe).toHaveBeenCalled());
    act(() =>
      subscriptions[0].options.onError(new GroupStatusStreamError(401)),
    );
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(router.replace).toHaveBeenCalledWith("/login");
    expect(subscriptions[0].stop).toHaveBeenCalledOnce();
  });

  it("404 수신 시 그룹 화면을 닫고 사용자가 다시 시도할 때만 재구독한다", async () => {
    render(<App />);
    await screen.findByTestId("group-state");
    await waitFor(() => expect(subscribe).toHaveBeenCalledOnce());
    act(() =>
      subscriptions[0].options.onError(new GroupStatusStreamError(404)),
    );
    expect(screen.queryByTestId("group-state")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      new GroupStatusStreamError(404).message,
    );
    expect(
      screen.getByRole("button", { name: "다시 시도" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    await waitFor(() => expect(subscribe).toHaveBeenCalledTimes(2));
  });

  it("403/차단 수신 시 다시 시도 버튼을 숨기고 홈으로 이동 단일 액션을 제공한다", async () => {
    render(<App />);
    await screen.findByTestId("group-state");
    await waitFor(() => expect(subscribe).toHaveBeenCalledOnce());
    act(() =>
      subscriptions[0].options.onError(new GroupStatusStreamError(403)),
    );
    expect(screen.queryByTestId("group-state")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      new GroupStatusStreamError(403).message,
    );
    expect(
      screen.queryByRole("button", { name: "다시 시도" }),
    ).not.toBeInTheDocument();
    const homeBtn = screen.getByRole("button", { name: "홈으로 이동" });
    expect(homeBtn).toBeInTheDocument();
    fireEvent.click(homeBtn);
    expect(router.replace).toHaveBeenCalledWith("/home");
  });

  it("StrictMode에서도 동시에 남아 있는 구독은 하나다", async () => {
    const { unmount } = render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    await screen.findByTestId("group-state");
    await waitFor(() => {
      expect(
        subscriptions.filter((entry) => entry.stop.mock.calls.length === 0),
      ).toHaveLength(1);
    });
    unmount();
    await waitFor(() => {
      expect(
        subscriptions.every((entry) => entry.stop.mock.calls.length === 1),
      ).toBe(true);
    });
  });
});
