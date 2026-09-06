import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getGroupDetail } from "@/features/group/api/group.api";
import {
  updateSecondRoundVote,
  voteSecondRound,
} from "../api/secondRoundVote.api";
import { VoteApiError } from "../api/voteApiError";
import { useAttendanceVote } from "./useAttendanceVote";

vi.mock("@/features/group/api/group.api", () => ({
  getGroupDetail: vi.fn(),
}));

vi.mock("../api/secondRoundVote.api", () => ({
  updateSecondRoundVote: vi.fn(),
  voteSecondRound: vi.fn(),
}));

describe("useAttendanceVote", () => {
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
  });

  it("정상 투표 제출 시 success: true를 반환한다", async () => {
    vi.mocked(voteSecondRound).mockResolvedValue();

    const { result } = renderHook(() => useAttendanceVote("10"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit("PARTICIPATE");
    });

    expect(submitResult).toEqual({ success: true });
    expect(voteSecondRound).toHaveBeenCalledWith("10", "PARTICIPATE");
    expect(updateSecondRoundVote).not.toHaveBeenCalled();
    expect(result.current.context.hasSubmitted).toBe(true);
  });

  it("기존 투표가 있으면 PATCH 정정 API를 호출하고 정정 결과를 반환한다", async () => {
    vi.mocked(updateSecondRoundVote).mockResolvedValue();

    const { result } = renderHook(() => useAttendanceVote("10", "PARTICIPATE"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.context.selectedChoice).toBe("PARTICIPATE");

    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit("NOT_PARTICIPATE");
    });

    expect(submitResult).toEqual({ success: true, isUpdated: true });
    expect(updateSecondRoundVote).toHaveBeenCalledWith("10", "NOT_PARTICIPATE");
    expect(voteSecondRound).not.toHaveBeenCalled();
    expect(result.current.context.hasSubmitted).toBe(true);
  });

  it("이미 투표 완료 에러(409/400 VoteApiError) 발생 시 isAlreadyVoted: true를 반환한다", async () => {
    vi.mocked(voteSecondRound).mockRejectedValue(
      new VoteApiError(
        409,
        "ALREADY_VOTED",
        "이미 2차 참여 투표를 완료했습니다.",
      ),
    );

    const { result } = renderHook(() => useAttendanceVote("10"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit("PARTICIPATE");
    });

    expect(submitResult).toEqual({ success: false, isAlreadyVoted: true });
    expect(result.current.context.hasSubmitted).toBe(true);
  });
});
