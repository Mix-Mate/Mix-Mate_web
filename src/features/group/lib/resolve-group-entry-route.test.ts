import { beforeEach, describe, expect, it, vi } from "vitest";
import { getGroupDetail } from "@/features/group/api/group.api";
import { getSecondRoundVoteStatus } from "@/features/vote/api/secondRoundVoteStatus.api";
import { resolveGroupEntryRoute } from "./resolve-group-entry-route";

vi.mock("@/features/group/api/group.api", () => ({
  getGroupDetail: vi.fn(),
}));

vi.mock("@/features/vote/api/secondRoundVoteStatus.api", () => ({
  getSecondRoundVoteStatus: vi.fn(),
}));

const getGroupDetailMock = vi.mocked(getGroupDetail);
const getSecondRoundVoteStatusMock = vi.mocked(getSecondRoundVoteStatus);

describe("resolveGroupEntryRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getGroupDetailMock.mockResolvedValue({
      groupId: 50,
      groupName: "투표 모임",
      description: null,
      status: "VOTING",
      inviteCode: "VOTE50",
      createdAt: "2026-09-01T00:00:00.000Z",
      memberCount: 4,
      myRole: "PARTICIPANT",
      myParticipantId: 1,
    });
  });

  it("미투표 사용자는 MVP 투표 화면으로 이동한다", async () => {
    getSecondRoundVoteStatusMock.mockResolvedValue({
      totalParticipantCount: 2,
      votedCount: 0,
      participateCount: 0,
      notParticipateCount: 0,
      participants: [
        { participantId: 1, displayName: "나", choice: null },
        { participantId: 2, displayName: "상대", choice: null },
      ],
    });

    await expect(
      resolveGroupEntryRoute("50", "PARTICIPANT", "VOTING"),
    ).resolves.toBe("/groups/50/votes/mvp");
  });

  it.each(["PARTICIPATE", "NOT_PARTICIPATE"] as const)(
    "%s 투표를 완료한 사용자는 투표 현황으로 바로 이동한다",
    async (choice) => {
      getSecondRoundVoteStatusMock.mockResolvedValue({
        totalParticipantCount: 2,
        votedCount: 1,
        participateCount: choice === "PARTICIPATE" ? 1 : 0,
        notParticipateCount: choice === "NOT_PARTICIPATE" ? 1 : 0,
        participants: [
          { participantId: 1, displayName: "나", choice },
          { participantId: 2, displayName: "상대", choice: null },
        ],
      });

      await expect(
        resolveGroupEntryRoute("50", "PARTICIPANT", "VOTING"),
      ).resolves.toBe("/groups/50/votes/status");
    },
  );

  it("투표 상태 확인에 실패하면 기존 MVP 경로로 이동한다", async () => {
    getSecondRoundVoteStatusMock.mockRejectedValue(new Error("조회 실패"));

    await expect(
      resolveGroupEntryRoute("50", "PARTICIPANT", "VOTING"),
    ).resolves.toBe("/groups/50/votes/mvp");
  });

  it("투표 중이 아니면 추가 API 조회 없이 기존 그룹 진입 경로를 사용한다", async () => {
    await expect(
      resolveGroupEntryRoute("50", "PARTICIPANT", "FIRST_ROUND"),
    ).resolves.toBe("/groups/50");
    expect(getGroupDetailMock).not.toHaveBeenCalled();
    expect(getSecondRoundVoteStatusMock).not.toHaveBeenCalled();
  });
});
