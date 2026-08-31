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

  it("조 편성 확정 후(또는 세션 진행 중) 그룹 홈 화면에서 뒤로가기 클릭 시 router.back() 대신 router.replace('/home')로 이동한다", () => {
    render(<UserHomeScreen />);

    const backButton = screen.getByRole("button", {
      name: "이전 화면으로 이동",
    });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/home");
    expect(backMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
