import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail, GroupStatus } from "@/features/group/types/group.types";
import VoteStatusScreen from "./VoteStatusScreen";

const { useAdminGroupQueryMock, useVoteStatusQueryMock } = vi.hoisted(() => ({
  useAdminGroupQueryMock: vi.fn(),
  useVoteStatusQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6" }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/vote/hooks/useVoteStatusQuery", () => ({
  useVoteStatusQuery: useVoteStatusQueryMock,
}));

vi.mock("@/features/vote/components/status/VoteProgressCard", () => ({
  default: () => null,
}));

vi.mock("@/features/vote/components/status/VoteStatusList", () => ({
  default: () => null,
}));

vi.mock("@/features/vote/components/status/VoteCompletionWatcher", () => ({
  default: () => null,
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
    myRole: "HOST",
    myParticipantId: 3,
  };
}

describe("VoteStatusScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useVoteStatusQueryMock.mockReturnValue({
      data: {
        totalParticipantCount: 2,
        votedCount: 1,
        participateCount: 1,
        notParticipateCount: 0,
        participants: [
          { participantId: 1, displayName: "참여자", choice: "PARTICIPATE" },
          { participantId: 2, displayName: "미투표자", choice: null },
        ],
      },
      isLoading: false,
      isRefreshing: false,
      error: null,
      isComplete: false,
    });
  });

  it("host이고 그룹 상태가 VOTING일 때만 강제 종료 버튼을 표시한다", () => {
    useAdminGroupQueryMock.mockReturnValue({ data: createGroup("VOTING") });
    const { rerender } = render(<VoteStatusScreen />);

    expect(
      screen.getByRole("button", { name: "전체 투표 종료하기" }),
    ).toBeInTheDocument();

    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("FIRST_ROUND"),
    });
    rerender(<VoteStatusScreen />);

    expect(
      screen.queryByRole("button", { name: "전체 투표 종료하기" }),
    ).not.toBeInTheDocument();
  });
});
