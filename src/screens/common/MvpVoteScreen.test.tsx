import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupMemberRole,
  GroupStatus,
} from "@/features/group/types/group.types";
import MvpVoteScreen from "./MvpVoteScreen";

const {
  pushMock,
  replaceMock,
  submitMock,
  useAdminGroupQueryMock,
  useMvpVoteMock,
  useVoteStatusQueryMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  submitMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useMvpVoteMock: vi.fn(),
  useVoteStatusQueryMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "7" }),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/group/hooks/useAdminGroupQuery", () => ({
  useAdminGroupQuery: useAdminGroupQueryMock,
}));

vi.mock("@/features/vote/hooks/useVoteStatusQuery", () => ({
  useVoteStatusQuery: useVoteStatusQueryMock,
}));

vi.mock("@/features/vote/hooks/useMvpVote", () => ({
  useMvpVote: useMvpVoteMock,
}));

function createGroup(
  status: GroupStatus = "VOTING",
  myRole: GroupMemberRole = "PARTICIPANT",
): GroupDetail {
  return {
    groupId: 7,
    groupName: "투표 모임",
    description: null,
    status,
    inviteCode: "VOTE12",
    createdAt: "2026-08-27T00:00:00.000Z",
    memberCount: 4,
    myRole,
    myParticipantId: 1,
  };
}

describe("MvpVoteScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "PARTICIPANT"),
    });
    useVoteStatusQueryMock.mockReturnValue({
      data: {
        totalParticipantCount: 4,
        votedCount: 0,
        participateCount: 0,
        notParticipateCount: 0,
        participants: [
          { participantId: 1, displayName: "나", choice: null },
          { participantId: 2, displayName: "상대1", choice: null },
        ],
      },
      isComplete: false,
    });
    useMvpVoteMock.mockReturnValue({
      context: {
        status: "OPEN",
        currentParticipantId: 1,
        candidates: [
          {
            participantId: 2,
            name: "후보자",
            department: "컴공",
            gender: "female",
            profileVisibility: "PUBLIC",
          },
        ],
        selectedParticipantId: null,
        hasSubmitted: false,
      },
      isLoading: false,
      isSubmitting: false,
      error: null,
      submit: submitMock,
    });
  });

  it.each(["PARTICIPANT", "HOST"] as const)(
    "%s가 MVP 투표를 제출하면 2차 참여 투표 화면으로 이동한다",
    async (myRole) => {
      useAdminGroupQueryMock.mockReturnValue({
        data: createGroup("VOTING", myRole),
      });
      submitMock.mockResolvedValue({ success: true });
      render(<MvpVoteScreen />);
      expect(replaceMock).not.toHaveBeenCalled();

      const candidateRadio = screen.getByDisplayValue("2");
      fireEvent.click(candidateRadio);

      const submitButton = screen.getByRole("button", {
        name: "다음 - 2차 참여 여부 투표 →",
      });
      fireEvent.click(submitButton);

      expect(submitMock).toHaveBeenCalledWith(2);
      await waitFor(() => {
        expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/attendance");
      });
      expect(pushMock).not.toHaveBeenCalled();
    },
  );

  it("일반 참가자가 투표 제출 시 이미 투표 완료 에러(isAlreadyVoted)가 발생하면 router.replace로 결과 화면으로 이동한다", async () => {
    submitMock.mockResolvedValue({ success: false, isAlreadyVoted: true });
    render(<MvpVoteScreen />);

    const candidateRadio = screen.getByDisplayValue("2");
    fireEvent.click(candidateRadio);

    const submitButton = screen.getByRole("button", {
      name: "다음 - 2차 참여 여부 투표 →",
    });
    fireEvent.click(submitButton);

    expect(submitMock).toHaveBeenCalledWith(2);
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/result");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("관리자(HOST)가 투표 제출 시 이미 투표 완료 에러가 발생하면 router.replace로 관리자 투표 현황 화면으로 이동한다", async () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "HOST"),
    });
    submitMock.mockResolvedValue({ success: false, isAlreadyVoted: true });
    render(<MvpVoteScreen />);

    const candidateRadio = screen.getByDisplayValue("2");
    fireEvent.click(candidateRadio);

    const submitButton = screen.getByRole("button", {
      name: "다음 - 2차 참여 여부 투표 →",
    });
    fireEvent.click(submitButton);

    expect(submitMock).toHaveBeenCalledWith(2);
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/groups/7/admin/votes/status");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("그룹 상태가 투표 종료 상태(VOTE_CLOSED)인 경우 router.replace로 결과 화면으로 즉시 리디렉션한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTE_CLOSED", "PARTICIPANT"),
    });

    render(<MvpVoteScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/result");
  });

  it("일반 참가자가 이미 투표를 완료한 경우(hasVoted) router.replace로 결과 화면으로 리디렉션한다", () => {
    useVoteStatusQueryMock.mockReturnValue({
      data: {
        totalParticipantCount: 4,
        votedCount: 1,
        participateCount: 1,
        notParticipateCount: 0,
        participants: [
          { participantId: 1, displayName: "나", choice: "PARTICIPATE" },
          { participantId: 2, displayName: "상대1", choice: null },
        ],
      },
      isComplete: false,
    });

    render(<MvpVoteScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/result");
  });

  it("관리자(HOST)가 이미 투표를 완료한 경우(hasVoted) router.replace로 관리자 투표 현황 화면으로 리디렉션한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "HOST"),
    });
    useVoteStatusQueryMock.mockReturnValue({
      data: {
        totalParticipantCount: 4,
        votedCount: 1,
        participateCount: 1,
        notParticipateCount: 0,
        participants: [
          { participantId: 1, displayName: "나", choice: "PARTICIPATE" },
          { participantId: 2, displayName: "상대1", choice: null },
        ],
      },
      isComplete: false,
    });

    render(<MvpVoteScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/7/admin/votes/status");
  });
});
