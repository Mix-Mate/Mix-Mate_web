import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import AddParticipantScreen from "@/screens/admin/AddParticipantScreen";
import ParticipantListScreen from "./ParticipantListScreen";

const {
  pushMock,
  searchParamsGetMock,
  useAdminGroupQueryMock,
  useMyGroupProfileQueryMock,
  useParticipantListQueryMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  searchParamsGetMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useMyGroupProfileQueryMock: vi.fn(),
  useParticipantListQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6" }),
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
  }),
  useSearchParams: () => ({ get: searchParamsGetMock }),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/participant/hooks/useParticipantListQuery", () => ({
  useParticipantListQuery: useParticipantListQueryMock,
}));

vi.mock("@/features/profile/hooks/useMyGroupProfileQuery", () => ({
  useMyGroupProfileQuery: useMyGroupProfileQueryMock,
}));

const recruitingHost: GroupDetail = {
  groupId: 6,
  groupName: "MixMate 모임",
  description: null,
  status: "RECRUITING",
  inviteCode: "ABC123",
  createdAt: "2026-09-02T00:00:00.000Z",
  memberCount: 1,
  myRole: "HOST",
  myParticipantId: 1,
};

describe("ParticipantListScreen manual participant addition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGetMock.mockReturnValue(null);
    useAdminGroupQueryMock.mockReturnValue({ data: recruitingHost });
    useParticipantListQueryMock.mockReturnValue({
      data: {
        participants: [],
        teams: [],
      },
      isLoading: false,
      isError: false,
    });
    useMyGroupProfileQueryMock.mockReturnValue({ data: null });
  });

  it("모집 중인 그룹의 관리자에게 사용자 추가 버튼을 보여준다", () => {
    render(<ParticipantListScreen />);

    fireEvent.click(screen.getByRole("button", { name: "사용자 추가" }));

    expect(pushMock).toHaveBeenCalledWith(
      "/groups/6/admin/participants/new?round=1&returnTo=participant-list",
    );
  });

  it("일반 참가자에게는 사용자 추가 버튼을 보여주지 않는다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: { ...recruitingHost, myRole: "PARTICIPANT" },
    });

    render(<ParticipantListScreen />);

    expect(
      screen.queryByRole("button", { name: "사용자 추가" }),
    ).not.toBeInTheDocument();
  });

  it("모집 중에는 전체/조별 보기 필터를 보여주지 않는다", () => {
    render(<ParticipantListScreen />);

    expect(
      screen.queryByLabelText("참가자 보기 방식"),
    ).not.toBeInTheDocument();
  });

  it("그룹명은 목록 응답 대신 전역 그룹 정보로 표시한다", () => {
    render(<ParticipantListScreen />);

    expect(screen.getByText("MixMate 모임 · 0명")).toBeInTheDocument();
  });

  it("조별 보기를 선택하기 전에는 팀 목록 조회를 활성화하지 않는다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: { ...recruitingHost, status: "SECOND_ROUND" },
    });

    render(<ParticipantListScreen />);

    expect(useParticipantListQueryMock).toHaveBeenLastCalledWith("6", {
      detailRole: "admin",
      includeTeams: false,
      round: 2,
    });

    fireEvent.click(screen.getByRole("button", { name: "조별" }));

    expect(useParticipantListQueryMock).toHaveBeenLastCalledWith("6", {
      detailRole: "admin",
      includeTeams: true,
      round: 2,
    });
  });

  it("모집 참가자 목록에서 연 추가 화면은 같은 목록으로 돌아간다", () => {
    searchParamsGetMock.mockImplementation((key: string) => {
      if (key === "round") return "1";
      if (key === "returnTo") return "participant-list";
      return null;
    });

    render(<AddParticipantScreen />);
    fireEvent.click(
      screen.getByRole("button", { name: "이전 화면으로 이동" }),
    );

    expect(pushMock).toHaveBeenCalledWith("/groups/6/participants?round=1");
  });
});
