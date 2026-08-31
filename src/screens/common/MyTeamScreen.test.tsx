import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminGroupQueryProvider from "@/features/group/components/AdminGroupQueryProvider";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import type { GroupDetail } from "@/features/group/types/group.types";
import type { MyTeamResponse } from "@/features/team/types/team.types";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import PlayScreenLayout from "@/screens/user/PlayScreenLayout";
import MyTeamScreen from "./MyTeamScreen";

const { pushMock, replaceMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
}));

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6" }),
  usePathname: () => "/groups/6/team",
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: vi.fn(),
  }),
  useSearchParams: () => searchParams,
}));

const groupUrl = `${API_BASE_URL}/api/v1/groups/6`;
const firstRoundTeamUrl = `${groupUrl}/rounds/FIRST_ROUND/teams/my-team`;
const secondRoundTeamUrl = `${groupUrl}/rounds/SECOND_ROUND/teams/my-team`;
const fetchMock = vi.fn<typeof fetch>();

const firstRoundTeam: MyTeamResponse = {
  round: "FIRST_ROUND",
  team: {
    teamNumber: 1,
    members: [
      {
        participantId: 1,
        displayName: "1차 조 멤버",
        major: "컴퓨터공학",
        gender: "MALE",
        visibility: "PUBLIC",
        fixed: false,
      },
    ],
  },
};

const secondRoundTeam: MyTeamResponse = {
  round: "SECOND_ROUND",
  team: {
    teamNumber: 2,
    members: [
      {
        participantId: 2,
        displayName: "2차 조 멤버",
        major: "경영학",
        gender: "FEMALE",
        visibility: "PUBLIC",
        fixed: false,
      },
    ],
  },
};

let group: GroupDetail;

function GroupRefreshButton() {
  const { refetch } = useAdminGroupQuery("6");

  return <button onClick={() => void refetch()}>그룹 상태 새로고침</button>;
}

function renderMyTeam() {
  return render(
    <AdminGroupQueryProvider>
      <GroupRefreshButton />
      <MyTeamScreen />
    </AdminGroupQueryProvider>,
  );
}

describe("MyTeamScreen API 회차 조회", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams = new URLSearchParams();
    group = {
      groupId: 6,
      groupName: "API 모임",
      description: null,
      status: "SECOND_ROUND",
      inviteCode: "ABC123",
      createdAt: "2026-08-27T00:00:00.000Z",
      memberCount: 6,
      myRole: "PARTICIPANT",
      myParticipantId: 2,
    };
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (input) => {
      switch (String(input)) {
        case groupUrl:
          return Response.json(group);
        case firstRoundTeamUrl:
          return Response.json(firstRoundTeam);
        case secondRoundTeamUrl:
          return Response.json(secondRoundTeam);
        default:
          throw new Error(`예상하지 못한 API 요청: ${String(input)}`);
      }
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(["", "scenario=round1-active", "scenario=round2-waiting"])(
    "URL 쿼리(%s)와 무관하게 API가 2차 진행 중이면 2차 조를 조회한다",
    async (query) => {
      searchParams = new URLSearchParams(query);
      renderMyTeam();

      expect(
        await screen.findByLabelText("2조에 배정되었습니다."),
      ).toBeInTheDocument();
      expect(screen.getByText("진행 상태 · 2차 진행 중")).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        secondRoundTeamUrl,
        expect.anything(),
      );
      expect(fetchMock).not.toHaveBeenCalledWith(
        firstRoundTeamUrl,
        expect.anything(),
      );
    },
  );

  it("URL이 2차여도 API가 1차 진행 중이면 1차 조를 조회한다", async () => {
    group.status = "FIRST_ROUND";
    searchParams = new URLSearchParams("scenario=round2-active");
    renderMyTeam();

    expect(
      await screen.findByLabelText("1조에 배정되었습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText("진행 상태 · 1차 진행 중")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      firstRoundTeamUrl,
      expect.anything(),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      secondRoundTeamUrl,
      expect.anything(),
    );
  });

  it("멤버 탭에서도 API 회차의 멤버를 표시하고 scenario를 다음 경로에 전달하지 않는다", async () => {
    searchParams = new URLSearchParams("tab=members&scenario=round1-active");
    renderMyTeam();

    expect(await screen.findByText("2차 조 멤버")).toBeInTheDocument();
    expect(screen.queryByText("1차 조 멤버")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "멤버" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    fireEvent.click(screen.getByRole("button", { name: "내 조" }));
    expect(pushMock).toHaveBeenLastCalledWith("/groups/6/team");

    fireEvent.click(screen.getByRole("button", { name: "멤버" }));
    expect(pushMock).toHaveBeenLastCalledWith("/groups/6/team?tab=members");

    fireEvent.click(screen.getByRole("button", { name: "사용자 홈으로 이동" }));
    expect(pushMock).toHaveBeenLastCalledWith("/groups/6");
  });

  it("그룹 API 응답을 기다리는 동안 임의로 1차 조를 요청하지 않는다", async () => {
    let resolveGroup!: (response: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveGroup = resolve;
        }),
    );
    renderMyTeam();

    expect(
      screen.getByText("그룹 정보를 불러오는 중입니다."),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      groupUrl,
      expect.anything(),
    );

    await act(async () => {
      resolveGroup(Response.json(group));
    });

    expect(
      await screen.findByLabelText("2조에 배정되었습니다."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(
      firstRoundTeamUrl,
      expect.anything(),
    );
  });

  it("그룹 API가 실패하면 mock으로 대체하거나 조를 조회하지 않는다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ message: "그룹 접근 권한이 없습니다." }, { status: 403 }),
    );
    renderMyTeam();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "그룹 접근 권한이 없습니다.",
    );
    expect(screen.queryByTestId("my-team-screen")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      groupUrl,
      expect.anything(),
    );
  });

  it("API가 2차 준비 중이면 아직 배정되지 않은 조를 요청하지 않는다", async () => {
    group.status = "BEFORE_SECOND_ROUND";
    renderMyTeam();

    expect(
      await screen.findByText("진행 상태 · 2차 준비 중"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      groupUrl,
      expect.anything(),
    );
  });

  it("화면을 유지한 채 API 상태가 1차에서 2차로 바뀌면 조 정보를 다시 조회한다", async () => {
    group.status = "FIRST_ROUND";
    searchParams = new URLSearchParams("scenario=round1-active");
    renderMyTeam();

    expect(
      await screen.findByLabelText("1조에 배정되었습니다."),
    ).toBeInTheDocument();

    group = { ...group, status: "SECOND_ROUND" };
    fireEvent.click(screen.getByRole("button", { name: "그룹 상태 새로고침" }));

    expect(
      await screen.findByLabelText("2조에 배정되었습니다."),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("1조에 배정되었습니다."),
    ).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      secondRoundTeamUrl,
      expect.anything(),
    );
  });

  it("함께 즐기기도 API 그룹 정보를 표시하고 scenario 없이 내 조로 이동한다", async () => {
    searchParams = new URLSearchParams("scenario=round1-active");
    render(
      <AdminGroupQueryProvider>
        <PlayScreenLayout backHref="/groups/6" testId="play-screen">
          놀이 메뉴
        </PlayScreenLayout>
      </AdminGroupQueryProvider>,
    );

    expect(await screen.findByText("API 모임")).toBeInTheDocument();
    expect(screen.getByTestId("play-screen")).toHaveAttribute(
      "data-status",
      "SECOND_ROUND",
    );

    fireEvent.click(screen.getByRole("button", { name: "내 조" }));
    expect(pushMock).toHaveBeenLastCalledWith("/groups/6/team");
  });
});
