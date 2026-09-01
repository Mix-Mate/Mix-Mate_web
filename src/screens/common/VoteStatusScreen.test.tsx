import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupMemberRole,
  GroupStatus,
} from "@/features/group/types/group.types";
import VoteStatusScreen from "./VoteStatusScreen";

const {
  pushMock,
  replaceMock,
  useAdminGroupQueryMock,
  useVoteStatusQueryMock,
} = vi.hoisted(() => ({
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
  myRole: GroupMemberRole = "PARTICIPANT",
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

  it("관리자(HOST)는 공통 현황 화면에서 전체 투표 종료 버튼을 사용할 수 있다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "HOST"),
    });

    render(<VoteStatusScreen />);

    fireEvent.click(screen.getByRole("button", { name: "전체 투표 종료하기" }));

    expect(pushMock).toHaveBeenCalledExactlyOnceWith(
      "/groups/6/admin/votes/end",
    );
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("일반 참가자(PARTICIPANT)에게는 전체 투표 종료 버튼을 노출하지 않는다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "PARTICIPANT"),
    });

    render(<VoteStatusScreen />);

    expect(
      screen.queryByRole("button", { name: "전체 투표 종료하기" }),
    ).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it.each(["PARTICIPANT", "HOST"] as const)(
    "%s는 헤더 뒤로가기에서 확인 후 메인 홈으로 이동한다",
    (myRole) => {
      useAdminGroupQueryMock.mockReturnValue({
        data: createGroup("VOTING", myRole),
      });

      render(<VoteStatusScreen />);
      fireEvent.click(
        screen.getByRole("button", { name: "이전 화면으로 이동" }),
      );

      expect(
        screen.getByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
      ).toBeInTheDocument();
      expect(replaceMock).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "나가기" }));

      expect(replaceMock).toHaveBeenCalledExactlyOnceWith("/home");
      expect(pushMock).not.toHaveBeenCalled();
    },
  );

  it("투표 종료 상태인 경우 결과 화면으로 이동한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTE_CLOSED", "PARTICIPANT"),
    });

    render(<VoteStatusScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/6/votes/result");
  });
});
