import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import UserHomeScreen from "./UserHomeScreen";

const {
  backMock,
  pushMock,
  replaceMock,
  useAdminGroupQueryMock,
  useMyTeamQueryMock,
  useVoteStatusQueryMock,
} = vi.hoisted(() => ({
  backMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useMyTeamQueryMock: vi.fn(),
  useVoteStatusQueryMock: vi.fn(),
}));

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "12" }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: backMock,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/team/hooks/useMyTeamQuery", () => ({
  useMyTeamQuery: useMyTeamQueryMock,
}));

vi.mock("@/features/vote/hooks/useVoteStatusQuery", () => ({
  useVoteStatusQuery: useVoteStatusQueryMock,
}));

vi.mock("@/features/group/hooks/useLeaveGroupMutation", () => ({
  useLeaveGroupMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/features/group/hooks/useFinishFirstRoundMutation", () => ({
  useFinishFirstRoundMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/features/group/hooks/useFinishGroupMutation", () => ({
  useFinishGroupMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

vi.mock("@/features/group/hooks/useDecideSecondRoundMutation", () => ({
  useDecideSecondRoundMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

const mockGroup: GroupDetail = {
  groupId: 12,
  groupName: "1차 진행 중 모임",
  description: null,
  status: "FIRST_ROUND",
  inviteCode: "ABC123",
  createdAt: "2026-08-27T00:00:00.000Z",
  memberCount: 6,
  myRole: "HOST",
  myParticipantId: 1,
};

describe("UserHomeScreen Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    useAdminGroupQueryMock.mockReturnValue({
      data: mockGroup,
      refetch: vi.fn(),
    });
    useMyTeamQueryMock.mockReturnValue({
      data: { teamNumber: 1 },
      isLoading: false,
      error: null,
    });
    useVoteStatusQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it.each(
    (["HOST", "PARTICIPANT"] as const).flatMap((myRole) =>
      (
        [
          "RECRUITING",
          "BEFORE_FIRST_ROUND",
          "FIRST_ROUND",
          "VOTING",
          "VOTE_CLOSED",
          "BEFORE_SECOND_ROUND",
          "SECOND_ROUND",
        ] as const
      ).map((status) => ({ myRole, status })),
    ),
  )(
    "$myRole / $status 그룹 홈은 자동 이동 없이 열리고 나가기 팝업을 띄운다",
    ({ myRole, status }) => {
      useAdminGroupQueryMock.mockReturnValue({
        data: { ...mockGroup, myRole, status },
        refetch: vi.fn(),
      });
      render(<UserHomeScreen />);

      expect(screen.queryByTestId("admin-progress")).not.toBeInTheDocument();

      const backButton = screen.getByRole("button", {
        name: "이전 화면으로 이동",
      });
      expect(backButton).toBeInTheDocument();

      fireEvent.click(backButton);

      expect(
        screen.getByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
      ).toBeInTheDocument();
      expect(replaceMock).not.toHaveBeenCalled();
      expect(backMock).not.toHaveBeenCalled();
      expect(pushMock).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["VOTING", "투표 화면으로 이동", "/groups/12/votes/mvp"],
    ["VOTE_CLOSED", "투표 결과 보기", "/groups/12/votes/result"],
  ] as const)(
    "%s 그룹 홈에서 투표 화면은 버튼을 선택해서 연다",
    (status, label, route) => {
      useAdminGroupQueryMock.mockReturnValue({
        data: { ...mockGroup, status },
        refetch: vi.fn(),
      });
      render(<UserHomeScreen />);

      expect(replaceMock).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: label }));
      expect(pushMock).toHaveBeenCalledExactlyOnceWith(route);
    },
  );

  it("확인 팝업에서 취소하면 그룹 홈에 머무른다", () => {
    render(<UserHomeScreen />);

    fireEvent.click(screen.getByRole("button", { name: "이전 화면으로 이동" }));
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(
      screen.queryByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
    ).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("확인 팝업에서 나가기를 선택하면 메인 홈으로 이동한다", () => {
    render(<UserHomeScreen />);

    fireEvent.click(screen.getByRole("button", { name: "이전 화면으로 이동" }));
    fireEvent.click(screen.getByRole("button", { name: "나가기" }));

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/home");
    expect(backMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("관리자가 투표 종료 후 명시적인 post-vote 경로로 들어오면 다음 단계 선택 팝업을 보여준다", () => {
    mockSearchParams = new URLSearchParams("dialog=post-vote");
    useAdminGroupQueryMock.mockReturnValue({
      data: { ...mockGroup, status: "VOTE_CLOSED" },
      refetch: vi.fn(),
    });

    render(<UserHomeScreen />);

    expect(
      screen.getByRole("dialog", { name: "1차 술자리가 종료되었습니다" }),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("2차 참여 참가자가 투표 종료 후 홈으로 돌아오면 1차 조가 아닌 대기 화면을 보여준다", () => {
    mockSearchParams = new URLSearchParams("scenario=round2-waiting");
    useAdminGroupQueryMock.mockReturnValue({
      data: {
        ...mockGroup,
        groupName: "투표가 끝난 모임",
        status: "VOTE_CLOSED",
        myRole: "PARTICIPANT",
      },
      refetch: vi.fn(),
    });
    useVoteStatusQueryMock.mockReturnValue({
      data: {
        totalParticipantCount: 6,
        votedCount: 6,
        participateCount: 4,
        notParticipateCount: 2,
        participants: [
          { participantId: 1, displayName: "나", choice: "PARTICIPATE" },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(<UserHomeScreen />);

    expect(screen.getByTestId("user-home")).toHaveAttribute(
      "data-scenario",
      "round2-waiting",
    );
    expect(screen.getByText("투표 종료")).toBeVisible();
    expect(screen.getByText("다음 진행을 기다리고 있습니다")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /배정 결과 확인하기/ }),
    ).not.toBeInTheDocument();
    expect(useMyTeamQueryMock).toHaveBeenLastCalledWith(
      "12",
      "SECOND_ROUND",
      false,
    );
  });
});
