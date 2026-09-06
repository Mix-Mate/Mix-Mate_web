import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMyGroupsApi, GroupApiError } from "@/features/group/api/group.api";
import { setAuthTokens } from "@/shared/api/authToken";
import HomeScreen, {
  sortActiveGroups,
  sortCompletedGroups,
  type HomeScreenGroupItem,
} from "./HomeScreen";

const { push, replace } = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}));

const mockRouter = { push, replace };

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("@/features/group/api/group.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/group/api/group.api")>()),
  getMyGroupsApi: vi.fn(),
}));

vi.mock("@/features/blacklist/api/blacklist.api", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/blacklist/api/blacklist.api")
  >()),
  checkUserBlockedInGroup: vi.fn().mockResolvedValue(null),
}));

const getMyGroupsApiMock = vi.mocked(getMyGroupsApi);

function createMockJwt(expSeconds: number) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: "123", exp: expSeconds }));
  return `${header}.${payload}.fake-signature`;
}

describe("HomeScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    // 기본적으로 유효한 토큰 설정 (만료되지 않은 24시간 유효 토큰)
    const futureExp = Math.floor(Date.now() / 1000) + 86400;
    setAuthTokens({ accessToken: createMockJwt(futureExp) });
  });

  describe("1. 그룹 목록 정렬", () => {
    it("진행 중인 그룹은 최근 업데이트/생성 순(내림차순)으로 정렬된다", () => {
      const items: HomeScreenGroupItem[] = [
        {
          id: "1",
          name: "오래된 모임",
          status: "RECRUITING",
          role: "HOST",
          memberCount: 4,
          date: "2026-08-01",
          createdAt: "2026-08-01T10:00:00Z",
          updatedAt: "2026-08-01T10:00:00Z",
        },
        {
          id: "2",
          name: "가장 최근 수정된 모임",
          status: "FIRST_ROUND",
          role: "PARTICIPANT",
          memberCount: 6,
          date: "2026-08-10",
          createdAt: "2026-08-05T10:00:00Z",
          updatedAt: "2026-08-20T12:00:00Z",
        },
        {
          id: "3",
          name: "최근 생성된 모임",
          status: "RECRUITING",
          role: "HOST",
          memberCount: 2,
          date: "2026-08-15",
          createdAt: "2026-08-15T10:00:00Z",
        },
      ];

      const sorted = sortActiveGroups(items);
      expect(sorted.map((g) => g.id)).toEqual(["2", "3", "1"]);
    });

    it("완료된 모임은 최근 완료/종료 순(내림차순)으로 정렬된다", () => {
      const items: HomeScreenGroupItem[] = [
        {
          id: "10",
          name: "일찍 끝난 모임",
          status: "FINISHED",
          role: "HOST",
          memberCount: 4,
          date: "2026-08-01",
          finishedAt: "2026-08-01T23:00:00Z",
        },
        {
          id: "20",
          name: "어제 끝난 모임",
          status: "FINISHED",
          role: "PARTICIPANT",
          memberCount: 8,
          date: "2026-08-28",
          finishedAt: "2026-08-28T23:00:00Z",
        },
        {
          id: "30",
          name: "방금 끝난 모임",
          status: "FINISHED",
          role: "HOST",
          memberCount: 6,
          date: "2026-09-01",
          finishedAt: "2026-09-01T23:00:00Z",
        },
      ];

      const sorted = sortCompletedGroups(items);
      expect(sorted.map((g) => g.id)).toEqual(["30", "20", "10"]);
    });

    it("API 조회 후 진행 중인 모임 목록이 최신순으로 렌더링된다", async () => {
      getMyGroupsApiMock.mockImplementation(async (params) => {
        if (params?.state === "active") {
          return {
            groups: [
              {
                groupId: 101,
                groupName: "1번 모임(과거)",
                status: "RECRUITING",
                role: "HOST",
                memberCount: 3,
                createdAt: "2026-08-10T10:00:00Z",
              },
              {
                groupId: 102,
                groupName: "2번 모임(최신)",
                status: "FIRST_ROUND",
                role: "HOST",
                memberCount: 5,
                createdAt: "2026-08-30T10:00:00Z",
              },
            ],
          };
        }
        return { groups: [] };
      });

      render(<HomeScreen userName="테스터" />);

      const firstItem = await screen.findByText("2번 모임(최신)");
      const secondItem = await screen.findByText("1번 모임(과거)");

      expect(firstItem).toBeInTheDocument();
      expect(secondItem).toBeInTheDocument();

      // DOM 순서 확인: 2번 모임이 1번 모임보다 먼저 위치해야 함
      const groupHeadings = screen.getAllByRole("heading", { level: 4 });
      expect(groupHeadings[0]).toHaveTextContent("2번 모임(최신)");
      expect(groupHeadings[1]).toHaveTextContent("1번 모임(과거)");
    });
  });

  describe("2. 토큰 만료 및 인증 가드", () => {
    it("토큰이 없으면 로그인 화면(/login)으로 router.replace 리디렉션된다", async () => {
      localStorage.clear();

      render(<HomeScreen userName="테스터" />);

      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith("/login");
      });
      expect(getMyGroupsApiMock).not.toHaveBeenCalled();
    });

    it("토큰이 만료(exp 경과)되었으면 스토리지를 정리하고 /login으로 router.replace 리디렉션된다", async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 600; // 10분 전 만료
      setAuthTokens({ accessToken: createMockJwt(pastExp) });
      localStorage.setItem("userName", "만료사용자");

      render(<HomeScreen userName="만료사용자" />);

      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith("/login");
      });
      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("userName")).toBeNull();
      expect(getMyGroupsApiMock).not.toHaveBeenCalled();
    });

    it("API 호출 시 401 오류가 발생하면 스토리지를 정리하고 /login으로 router.replace 리디렉션된다", async () => {
      getMyGroupsApiMock.mockRejectedValue(
        new GroupApiError("토큰이 없거나 만료되었습니다.", 401),
      );

      render(<HomeScreen userName="테스터" />);

      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith("/login");
      });
      expect(localStorage.getItem("accessToken")).toBeNull();
    });
  });

  describe("3. 그룹 진입 라우팅", () => {
    it.each([
      ["RECRUITING", "HOST", "/groups/31"],
      ["BEFORE_FIRST_ROUND", "HOST", "/groups/31"],
      ["FIRST_ROUND", "HOST", "/groups/31"],
      ["BEFORE_SECOND_ROUND", "HOST", "/groups/31"],
      ["SECOND_ROUND", "HOST", "/groups/31"],
      ["VOTE_CLOSED", "HOST", "/groups/31"],
      ["VOTING", "HOST", "/groups/31"],
      ["RECRUITING", "PARTICIPANT", "/groups/31"],
      ["BEFORE_FIRST_ROUND", "PARTICIPANT", "/groups/31"],
      ["FIRST_ROUND", "PARTICIPANT", "/groups/31"],
      ["BEFORE_SECOND_ROUND", "PARTICIPANT", "/groups/31"],
      ["SECOND_ROUND", "PARTICIPANT", "/groups/31"],
      ["VOTE_CLOSED", "PARTICIPANT", "/groups/31"],
      ["VOTING", "PARTICIPANT", "/groups/31"],
    ])(
      "%s 상태 및 %s 역할에서도 메인 홈에서 선택하면 그룹 홈으로 연결한다",
      async (status, role, expectedRoute) => {
        getMyGroupsApiMock.mockImplementation(async (params) => ({
          groups:
            params?.state === "active"
              ? [
                  {
                    groupId: 31,
                    groupName: "라우팅 테스트 모임",
                    status,
                    role,
                    memberCount: 6,
                    createdAt: "2026-09-01T10:00:00Z",
                  },
                ]
              : [],
        }));

        render(<HomeScreen userName="테스터" />);

        const groupCard = await screen.findByRole("button", {
          name: /라우팅 테스트 모임/,
        });
        fireEvent.click(groupCard);

        await waitFor(() => {
          expect(push).toHaveBeenCalledWith(expectedRoute);
        });
      },
    );

    it("차단된 참가자가 그룹 클릭 시 차단 팝업이 노출되고 페이지 이동하지 않는다", async () => {
      const { checkUserBlockedInGroup } =
        await import("@/features/blacklist/api/blacklist.api");
      vi.mocked(checkUserBlockedInGroup).mockResolvedValueOnce({
        id: "1",
        userId: 1,
        name: "테스터",
        displayName: "테스터",
        email: "tester@example.com",
        reason: "부적절한 언행으로 차단되었습니다.",
        bannedAt: "2026-09-01T12:00:00Z",
        blockedAt: "2026-09-01T12:00:00Z",
      });

      getMyGroupsApiMock.mockImplementation(async (params) => ({
        groups:
          params?.state === "active"
            ? [
                {
                  groupId: 50,
                  groupName: "차단된 모임",
                  status: "FIRST_ROUND",
                  role: "PARTICIPANT",
                  memberCount: 4,
                  createdAt: "2026-09-01T10:00:00Z",
                },
              ]
            : [],
      }));

      render(<HomeScreen userName="테스터" />);

      const blockedCard = await screen.findByRole("button", {
        name: /차단된 모임/,
      });
      fireEvent.click(blockedCard);

      expect(
        await screen.findByText("그룹 이용 제한 안내"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("관리자에 의해 해당 그룹에서 차단되었습니다."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/차단 사유:/)).not.toBeInTheDocument();
      expect(push).not.toHaveBeenCalled();
    });

    it("서버의 차단 그룹 API 응답이 홈 화면에 '차단됨' 뱃지와 함께 표시되고, '목록에서 삭제하기' 클릭 시 화면과 로컬에서 제거된다", async () => {
      const { readBlockedGroups } =
        await import("@/features/blacklist/lib/blockedGroupsStorage");

      getMyGroupsApiMock.mockImplementation(async (params) => {
        if (params?.state === "banned") {
          return {
            groups: [
              {
                groupId: 77,
                groupName: "퇴장당한 모임",
                reason: "노쇼 3회 누적",
                bannedAt: "2026-09-01T12:00:00Z",
              },
            ],
          };
        }
        return { groups: [] };
      });

      render(<HomeScreen userName="테스터" />);

      expect(await screen.findByText("퇴장당한 모임")).toBeInTheDocument();
      expect(screen.getByText("차단됨")).toBeInTheDocument();

      const card = screen.getByRole("button", { name: /퇴장당한 모임/ });
      fireEvent.click(card);

      expect(
        await screen.findByText("그룹 이용 제한 안내"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("관리자에 의해 해당 그룹에서 차단되었습니다."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/차단 사유:/)).not.toBeInTheDocument();

      const deleteBtn = screen.getByRole("button", {
        name: "목록에서 삭제하기",
      });
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(screen.queryByText("퇴장당한 모임")).not.toBeInTheDocument();
      });

      expect(readBlockedGroups()).toHaveLength(0);
    });

    it("차단된 그룹 클릭 시 모달에 차단 사유 없이 기본 안내 문구만 노출된다", async () => {
      getMyGroupsApiMock.mockImplementation(async (params) => {
        if (params?.state === "banned") {
          return {
            groups: [
              {
                groupId: 88,
                groupName: "사유없는 차단 모임",
              },
            ],
          };
        }
        return { groups: [] };
      });

      render(<HomeScreen userName="테스터" />);

      const card = await screen.findByRole("button", {
        name: /사유없는 차단 모임/,
      });
      fireEvent.click(card);

      expect(
        await screen.findByText("그룹 이용 제한 안내"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("관리자에 의해 해당 그룹에서 차단되었습니다."),
      ).toBeInTheDocument();
      expect(screen.queryByText(/차단 사유:/)).not.toBeInTheDocument();
    });

    it("로컬 스토리지에 차단 그룹이 남아 있어도 서버의 banned 응답이 비어 있으면 차단 카드를 표시하지 않는다", async () => {
      const { recordBlockedGroup, saveKnownGroupName } =
        await import("@/features/blacklist/lib/blockedGroupsStorage");

      recordBlockedGroup({
        groupId: "555",
        groupName: "차단된 그룹",
        reason: "비매너 행위",
      });
      saveKnownGroupName("555", "신촌 불금 볼링 클럽");

      getMyGroupsApiMock.mockImplementation(async () => ({
        groups: [],
      }));

      render(<HomeScreen userName="테스터" />);

      expect(
        await screen.findByText("진행 중인 모임이 없습니다."),
      ).toBeInTheDocument();
      expect(screen.queryByText("신촌 불금 볼링 클럽")).not.toBeInTheDocument();
      expect(screen.queryByText("차단된 그룹")).not.toBeInTheDocument();
    });

    it("서버의 banned 응답이 로컬 더미 차단 그룹명보다 우선하며 로컬 스토리지도 최신 정보로 갱신한다", async () => {
      const { readBlockedGroups } =
        await import("@/features/blacklist/lib/blockedGroupsStorage");

      localStorage.setItem(
        "mixmate_blocked_groups",
        JSON.stringify([
          {
            groupId: "777",
            groupName: "차단된 그룹",
            reason: "강제 퇴장",
          },
        ]),
      );

      getMyGroupsApiMock.mockImplementation(async (params) => {
        if (params?.state === "banned") {
          return {
            groups: [
              {
                groupId: 777,
                groupName: "원래 이름있는 스터디",
                reason: "서버 차단 사유",
                bannedAt: "2026-09-02T12:00:00Z",
              },
            ],
          };
        }
        return { groups: [] };
      });

      render(<HomeScreen userName="테스터" />);

      expect(
        await screen.findByText("원래 이름있는 스터디"),
      ).toBeInTheDocument();
      expect(screen.queryByText("차단된 그룹")).not.toBeInTheDocument();

      await waitFor(() => {
        const stored = readBlockedGroups();
        expect(stored.find((g) => g.groupId === "777")?.groupName).toBe(
          "원래 이름있는 스터디",
        );
        expect(stored.find((g) => g.groupId === "777")?.reason).toBe(
          "서버 차단 사유",
        );
      });
    });

    it("차단된 그룹을 '목록에서 삭제하기'로 삭제한 뒤 페이지를 새로고침(재마운트)해도 해당 차단 카드가 다시 부활하지 않는다", async () => {
      const { readBlockedGroups, isDismissedBlockedGroup } =
        await import("@/features/blacklist/lib/blockedGroupsStorage");

      getMyGroupsApiMock.mockImplementation(async (params) => {
        if (params?.state === "banned") {
          return {
            groups: [
              {
                groupId: 999,
                groupName: "삭제할 차단 그룹",
                reason: "규칙 위반",
                bannedAt: "2026-09-01T12:00:00Z",
              },
            ],
          };
        }
        return { groups: [] };
      });

      const { unmount } = render(<HomeScreen userName="테스터" />);

      expect(await screen.findByText("삭제할 차단 그룹")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /삭제할 차단 그룹/ }));
      expect(
        await screen.findByText("그룹 이용 제한 안내"),
      ).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole("button", { name: "목록에서 삭제하기" }),
      );

      await waitFor(() => {
        expect(screen.queryByText("삭제할 차단 그룹")).not.toBeInTheDocument();
      });
      expect(readBlockedGroups()).toHaveLength(0);
      expect(isDismissedBlockedGroup("999")).toBe(true);

      unmount();

      render(<HomeScreen userName="테스터" />);

      expect(
        await screen.findByText("진행 중인 모임이 없습니다."),
      ).toBeInTheDocument();
      expect(screen.queryByText("삭제할 차단 그룹")).not.toBeInTheDocument();
      expect(readBlockedGroups()).toHaveLength(0);
      expect(isDismissedBlockedGroup("999")).toBe(true);
    });
  });
});
