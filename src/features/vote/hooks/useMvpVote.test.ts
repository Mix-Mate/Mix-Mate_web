import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getGroupDetail } from "@/features/group/api/group.api";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import { voteMvp } from "../api/mvpVote.api";
import { VoteApiError } from "../api/voteApiError";
import { useMvpVote } from "./useMvpVote";

vi.mock("@/features/group/api/group.api", () => ({
  getGroupDetail: vi.fn(),
}));

vi.mock("@/features/team/hooks/useMyTeamQuery", () => ({
  useMyTeamQuery: vi.fn(),
}));

vi.mock("../api/mvpVote.api", () => ({
  voteMvp: vi.fn(),
}));

describe("useMvpVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getGroupDetail).mockResolvedValue({
      groupId: 10,
      groupName: "모임",
      description: null,
      status: "VOTING",
      inviteCode: "ABC",
      createdAt: "2026-08-27T00:00:00.000Z",
      memberCount: 4,
      myRole: "PARTICIPANT",
      myParticipantId: 1,
    });
    vi.mocked(useMyTeamQuery).mockReturnValue({
      data: {
        teamNumber: 1,
        mission: null,
        members: [
          {
            participantId: 1,
            displayName: "나",
            major: "컴공",
            gender: "MALE",
            visibility: "PUBLIC",
          },
          {
            participantId: 2,
            displayName: "후보자",
            major: "경영",
            gender: "FEMALE",
            visibility: "PUBLIC",
          },
        ],
      },
      isLoading: false,
      error: null,
    });
  });

  it("정상 투표 제출 시 success: true를 반환한다", async () => {
    vi.mocked(voteMvp).mockResolvedValue();

    const { result } = renderHook(() => useMvpVote("10"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit(2);
    });

    expect(submitResult).toEqual({ success: true });
    expect(result.current.context.hasSubmitted).toBe(true);
  });

  it("이미 투표 완료 에러(409/400 VoteApiError) 발생 시 isAlreadyVoted: true를 반환한다", async () => {
    vi.mocked(voteMvp).mockRejectedValue(
      new VoteApiError(409, "ALREADY_VOTED", "이미 투표에 참여하셨습니다."),
    );

    const { result } = renderHook(() => useMvpVote("10"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit(2);
    });

    expect(submitResult).toEqual({ success: false, isAlreadyVoted: true });
    expect(result.current.context.hasSubmitted).toBe(true);
  });
});
