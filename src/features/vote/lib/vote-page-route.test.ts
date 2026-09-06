import { describe, expect, it } from "vitest";
import type { GroupDetail } from "@/features/group/types/group.types";
import { getVotePageRedirect } from "./vote-page-route";

const votingGroup: GroupDetail = {
  groupId: 7,
  groupName: "투표 모임",
  description: null,
  status: "VOTING",
  inviteCode: "VOTE12",
  createdAt: "2026-08-27T00:00:00.000Z",
  memberCount: 4,
  myRole: "PARTICIPANT",
  myParticipantId: 1,
};

describe("getVotePageRedirect", () => {
  it("일반 투표 화면은 이미 참여 여부를 제출한 사용자를 현황으로 보낸다", () => {
    expect(getVotePageRedirect("7", votingGroup, false, true)).toBe(
      "/groups/7/votes/status",
    );
  });

  it("정정 모드는 전원 제출 상태여도 실제 투표가 진행 중이면 진입을 허용한다", () => {
    expect(getVotePageRedirect("7", votingGroup, true, true, true)).toBeNull();
  });

  it("정정 모드여도 실제 투표가 종료된 뒤에는 결과 화면으로 보낸다", () => {
    expect(
      getVotePageRedirect(
        "7",
        { ...votingGroup, status: "VOTE_CLOSED" },
        true,
        true,
        true,
      ),
    ).toBe("/groups/7/votes/result");
  });
});
