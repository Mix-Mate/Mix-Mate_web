import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GroupDetail,
  GroupMemberRole,
  GroupStatus,
} from "@/features/group/types/group.types";
import AttendanceVoteScreen from "./AttendanceVoteScreen";

const {
  pushMock,
  replaceMock,
  submitMock,
  useAdminGroupQueryMock,
  useAttendanceVoteMock,
  useVoteStatusQueryMock,
  backMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  submitMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useAttendanceVoteMock: vi.fn(),
  useVoteStatusQueryMock: vi.fn(),
  backMock: vi.fn(),
}));

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "7" }),
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

vi.mock("@/features/vote/hooks/useVoteStatusQuery", () => ({
  useVoteStatusQuery: useVoteStatusQueryMock,
}));

vi.mock("@/features/vote/hooks/useAttendanceVote", () => ({
  useAttendanceVote: useAttendanceVoteMock,
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

describe("AttendanceVoteScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
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
    useAttendanceVoteMock.mockReturnValue({
      context: {
        status: "OPEN",
        selectedChoice: null,
        hasSubmitted: false,
      },
      isLoading: false,
      isSubmitting: false,
      error: null,
      submit: submitMock,
    });
  });

  it.each(["HOST", "PARTICIPANT"] as const)(
    "%s는 Attendance 직접 진입·새로고침 뒤에도 MVP로 돌아간다",
    (myRole) => {
      useAdminGroupQueryMock.mockReturnValue({
        data: createGroup("VOTING", myRole),
      });
      mockSearchParams = new URLSearchParams(
        `role=${myRole === "HOST" ? "user" : "admin"}&scenario=round2-waiting`,
      );
      const { unmount } = render(<AttendanceVoteScreen />);
      unmount();
      render(<AttendanceVoteScreen />);
      fireEvent.click(
        screen.getByRole("button", { name: "이전 화면으로 이동" }),
      );
      expect(replaceMock).toHaveBeenCalledExactlyOnceWith(
        "/groups/7/votes/mvp?scenario=round2-waiting",
      );
      expect(pushMock).not.toHaveBeenCalled();
      expect(backMock).not.toHaveBeenCalled();
    },
  );

  it("일반 참가자가 2차 참여 여부 제출 성공 시 router.replace로 투표 현황(/votes/status) 화면으로 이동한다", async () => {
    submitMock.mockResolvedValue({ success: true });
    render(<AttendanceVoteScreen />);

    const participateRadio = screen.getByDisplayValue("PARTICIPATE");
    fireEvent.click(participateRadio);

    const submitButton = screen.getByRole("button", {
      name: "투표 완료하기",
    });
    fireEvent.click(submitButton);

    expect(submitMock).toHaveBeenCalledWith("PARTICIPATE");
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/status");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("관리자(HOST)가 2차 참여 여부 제출 성공 시 공통 투표 현황 화면으로 이동한다", async () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "HOST"),
    });
    submitMock.mockResolvedValue({ success: true });
    render(<AttendanceVoteScreen />);

    const participateRadio = screen.getByDisplayValue("PARTICIPATE");
    fireEvent.click(participateRadio);

    const submitButton = screen.getByRole("button", {
      name: "투표 완료하기",
    });
    fireEvent.click(submitButton);

    expect(submitMock).toHaveBeenCalledWith("PARTICIPATE");
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/status");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("일반 참가자가 이미 제출했어도 전체 투표 중이면 투표 현황으로 이동한다", async () => {
    submitMock.mockResolvedValue({ success: false, isAlreadyVoted: true });
    render(<AttendanceVoteScreen />);

    const participateRadio = screen.getByDisplayValue("PARTICIPATE");
    fireEvent.click(participateRadio);

    const submitButton = screen.getByRole("button", {
      name: "투표 완료하기",
    });
    fireEvent.click(submitButton);

    expect(submitMock).toHaveBeenCalledWith("PARTICIPATE");
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/status");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("관리자(HOST)가 이미 투표 완료 에러 발생 시 공통 투표 현황 화면으로 이동한다", async () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTING", "HOST"),
    });
    submitMock.mockResolvedValue({ success: false, isAlreadyVoted: true });
    render(<AttendanceVoteScreen />);

    const participateRadio = screen.getByDisplayValue("PARTICIPATE");
    fireEvent.click(participateRadio);

    const submitButton = screen.getByRole("button", {
      name: "투표 완료하기",
    });
    fireEvent.click(submitButton);

    expect(submitMock).toHaveBeenCalledWith("PARTICIPATE");
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/status");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("그룹 상태가 투표 종료 상태(VOTE_CLOSED)인 경우 router.replace로 결과 화면으로 즉시 리디렉션한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTE_CLOSED", "PARTICIPANT"),
    });

    render(<AttendanceVoteScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/result");
  });

  it("이미 제출한 참가자가 재진입해도 전체 투표 중이면 현황 화면으로 이동한다", () => {
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

    render(<AttendanceVoteScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/status");
  });

  it("관리자(HOST)가 이미 투표를 완료한 경우(hasVoted) 공통 투표 현황 화면으로 리디렉션한다", () => {
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

    render(<AttendanceVoteScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/status");
  });
});
