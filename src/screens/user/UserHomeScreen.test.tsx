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

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "12" }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: backMock,
  }),
  useSearchParams: () => new URLSearchParams(),
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

  it("그룹 홈에서 뒤로가기 클릭 시 메인 홈 이동 확인 팝업을 띄운다", () => {
    render(<UserHomeScreen />);

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
  });

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
});
