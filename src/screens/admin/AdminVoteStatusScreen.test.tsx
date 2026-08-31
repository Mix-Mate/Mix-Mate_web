import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupMemberRole,
  GroupStatus,
} from "@/features/group/types/group.types";
import AdminVoteStatusScreen from "./AdminVoteStatusScreen";

const { pushMock, replaceMock, useAdminGroupQueryMock, useVoteStatusQueryMock } =
  vi.hoisted(() => ({
    pushMock: vi.fn(),
    replaceMock: vi.fn(),
    useAdminGroupQueryMock: vi.fn(),
    useVoteStatusQueryMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "6" }),
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
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

function createGroup(
  status: GroupStatus = "VOTING",
  myRole: GroupMemberRole = "HOST",
): GroupDetail {
  return {
    groupId: 6,
    groupName: "API 그룹",
    description: null,
    status,
    inviteCode: "ABC123",
    createdAt: "2026-08-27T00:00:00.000Z",
    memberCount: 8,
    myRole,
    myParticipantId: 3,
  };
}

describe("AdminVoteStatusScreen", () => {
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

  it("비관리자(PARTICIPANT)가 접근 시 일반 사용자 투표 현황 화면(/votes/status)으로 리디렉션한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "PARTICIPANT"),
    });

    render(<AdminVoteStatusScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/6/votes/status");
  });

  it("관리자(HOST)이고 그룹 상태가 VOTING일 때 강제 종료 버튼을 표시한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "HOST"),
    });

    render(<AdminVoteStatusScreen />);

    expect(
      screen.getByRole("button", { name: "전체 투표 종료하기" }),
    ).toBeInTheDocument();
  });

  it("투표 종료 상태인 경우 결과 화면으로 이동한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTE_CLOSED", "HOST"),
    });

    render(<AdminVoteStatusScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/6/votes/result");
  });
});
