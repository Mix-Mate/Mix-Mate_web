import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupMemberRole,
  GroupStatus,
} from "@/features/group/types/group.types";
import type { VoteResultResponse } from "@/features/vote/types/voteResult.types";
import VoteResultScreen from "./VoteResultScreen";

const {
  pushMock,
  replaceMock,
  useAdminGroupQueryMock,
  useMyTeamQueryMock,
  useVoteResultQueryMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useMyTeamQueryMock: vi.fn(),
  useVoteResultQueryMock: vi.fn(),
}));

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "10" }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/vote/hooks/useVoteResultQuery", () => ({
  useVoteResultQuery: useVoteResultQueryMock,
}));

vi.mock("@/features/team/hooks/useMyTeamQuery", () => ({
  useMyTeamQuery: useMyTeamQueryMock,
}));

vi.mock("@/features/vote/components/result/VoteResultContent", () => ({
  default: ({
    onHome,
    onRevealOverallResult,
  }: {
    onHome: () => void;
    onRevealOverallResult: () => void;
  }) => (
    <div>
      <span>투표 결과 컨텐츠</span>
      <button onClick={onHome}>홈으로 돌아가기</button>
      <button onClick={onRevealOverallResult}>전체 결과 보기</button>
    </div>
  ),
}));

function createGroup(
  status: GroupStatus = "VOTING",
  myRole: GroupMemberRole = "HOST",
): GroupDetail {
  return {
    groupId: 10,
    groupName: "모임",
    description: null,
    status,
    inviteCode: "ABC",
    createdAt: "2026-08-27T00:00:00.000Z",
    memberCount: 4,
    myRole,
    myParticipantId: 1,
  };
}

const mockVoteResult: VoteResultResponse = {
  mvpWinners: [
    {
      teamNumber: 1,
      participantId: 2,
      displayName: "우승자",
      grade: "FIRST",
      mbti: "ENFP",
    },
  ],
  secondRoundParticipants: [
    {
      participantId: 1,
      displayName: "나",
      major: "컴공",
      gender: "MALE",
      visibility: "PUBLIC",
    },
  ],
};

describe("VoteResultScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "HOST"),
      isLoading: false,
      error: null,
    });
    useVoteResultQueryMock.mockReturnValue({
      data: mockVoteResult,
      isLoading: false,
      error: null,
    });
    useMyTeamQueryMock.mockReturnValue({
      data: { teamNumber: 1, members: [] },
      isLoading: false,
      error: null,
    });
  });

  it("관리자(HOST)가 결과 화면에서 뒤로가기를 누르면 확인 후 메인 홈으로 이동한다", () => {
    render(<VoteResultScreen />);

    const backButton = screen.getByRole("button", {
      name: "이전 화면으로 이동",
    });
    fireEvent.click(backButton);

    expect(
      screen.getByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "나가기" }));

    expect(replaceMock).toHaveBeenCalledWith("/home");
    expect(pushMock).not.toHaveBeenCalledWith("/groups/10?dialog=post-vote");
  });

  it("관리자(HOST)가 하단 홈 버튼을 누르면 replace로 ?dialog=post-vote 경로로 이동한다", () => {
    render(<VoteResultScreen />);

    const homeButton = screen.getByRole("button", { name: "홈으로 돌아가기" });
    fireEvent.click(homeButton);

    expect(replaceMock).toHaveBeenCalledWith("/groups/10?dialog=post-vote");
    expect(pushMock).not.toHaveBeenCalledWith("/home");
  });

  it("전체 결과 보기(?view=overall) 상태에서 뒤로가기를 누르면 기본 투표 결과 화면으로 이동한다", () => {
    mockSearchParams = new URLSearchParams("view=overall");
    render(<VoteResultScreen />);

    const backButton = screen.getByRole("button", {
      name: "이전 화면으로 이동",
    });
    fireEvent.click(backButton);

    expect(pushMock).toHaveBeenCalledWith("/groups/10/votes/result");
  });

  it("일반 참가자가 2차 참여를 신청한 상태에서 뒤로가기를 누르면 2차 대기 화면으로 이동한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "PARTICIPANT"),
      isLoading: false,
      error: null,
    });

    render(<VoteResultScreen />);

    const backButton = screen.getByRole("button", {
      name: "이전 화면으로 이동",
    });
    fireEvent.click(backButton);

    expect(pushMock).toHaveBeenCalledWith("/groups/10?scenario=round2-waiting");
  });

  it("2차에 불참하는 일반 참가자는 결과 화면에서 뒤로가기 시 확인 후 메인 홈으로 이동한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "PARTICIPANT"),
      isLoading: false,
      error: null,
    });
    useVoteResultQueryMock.mockReturnValue({
      data: { ...mockVoteResult, secondRoundParticipants: [] },
      isLoading: false,
      error: null,
    });

    render(<VoteResultScreen />);
    fireEvent.click(screen.getByRole("button", { name: "이전 화면으로 이동" }));

    expect(
      screen.getByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "나가기" }));

    expect(replaceMock).toHaveBeenCalledWith("/home");
  });
});
