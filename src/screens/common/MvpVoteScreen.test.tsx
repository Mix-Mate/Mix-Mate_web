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
  backMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  submitMock: vi.fn(),
  useAdminGroupQueryMock: vi.fn(),
  useMvpVoteMock: vi.fn(),
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

  it("일반 참가자가 이미 MVP를 제출했어도 미완료된 2차 참여 투표로 이동한다", async () => {
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
      expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/attendance");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("관리자도 이미 MVP를 제출했다면 현황 화면으로 건너뛰지 않고 2차 참여 투표로 이동한다", async () => {
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
      expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/attendance");
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it.each(["HOST", "PARTICIPANT"] as const)(
    "%s는 직접 진입·새로고침 후 헤더 뒤로가기에서 메인 홈 이동 팝업을 확인한다",
    (myRole) => {
      useAdminGroupQueryMock.mockReturnValue({
        data: createGroup("VOTING", myRole),
      });
      mockSearchParams = new URLSearchParams(
        "role=admin&scenario=round2-waiting",
      );
      const { unmount } = render(<MvpVoteScreen />);
      unmount();
      render(<MvpVoteScreen />);
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
      expect(backMock).not.toHaveBeenCalled();
    },
  );

  it("메인 홈 이동 팝업에서 취소하면 MVP 투표 화면에 머무른다", () => {
    render(<MvpVoteScreen />);

    fireEvent.click(screen.getByRole("button", { name: "이전 화면으로 이동" }));
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(
      screen.queryByRole("dialog", { name: "메인 홈으로 나가시겠습니까?" }),
    ).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("뒤로가기 이후 MVP 응답이 도착해도 다시 투표 화면으로 데려오지 않는다", async () => {
    let resolve!: (result: { success: boolean }) => void;
    submitMock.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    render(<MvpVoteScreen />);
    fireEvent.click(screen.getByDisplayValue("2"));
    fireEvent.click(
      screen.getByRole("button", { name: "다음 - 2차 참여 여부 투표 →" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "이전 화면으로 이동" }));
    fireEvent.click(screen.getByRole("button", { name: "나가기" }));
    resolve({ success: true });
    await waitFor(() => expect(submitMock).toHaveBeenCalledOnce());
    expect(replaceMock).toHaveBeenCalledExactlyOnceWith("/home");
  });

  it("그룹 상태가 투표 종료 상태(VOTE_CLOSED)인 경우 router.replace로 결과 화면으로 즉시 리디렉션한다", () => {
    useAdminGroupQueryMock.mockReturnValue({
      data: createGroup("VOTE_CLOSED", "PARTICIPANT"),
    });

    render(<MvpVoteScreen />);

    expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/result");
  });

  it("MVP와 참여 투표를 마친 참가자는 전체 투표가 끝날 때까지 현황 화면으로 이동한다", () => {
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

    expect(replaceMock).toHaveBeenCalledWith("/groups/7/votes/status");
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
