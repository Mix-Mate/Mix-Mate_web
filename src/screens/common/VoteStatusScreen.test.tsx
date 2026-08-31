import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupDetail, GroupStatus, UserRole } from "@/features/group/types/group.types";
import VoteStatusScreen from "./VoteStatusScreen";

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
  myRole: UserRole = "PARTICIPANT",
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

describe("VoteStatusScreen (User-facing)", () => {
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

  it("관리자(HOST)가 접근하면 관리자 전용 투표 현황 화면(/admin/votes/status)으로 즉시 리디렉션한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "HOST"),
    });

    render(<VoteStatusScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/6/admin/votes/status");
  });

  it("일반 참가자(PARTICIPANT)가 접근 시 관리자 화면으로 리디렉션되지 않는다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "PARTICIPANT"),
    });

    render(<VoteStatusScreen />);

    expect(replaceMock).not.toHaveBeenCalledWith("/groups/6/admin/votes/status");
  });

  it("투표 종료 상태인 경우 결과 화면으로 이동한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTE_CLOSED", "PARTICIPANT"),
    });

    render(<VoteStatusScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/6/votes/result");
  });
});
