import { describe, expect, it } from "vitest";
import type {
  GroupDetail,
  GroupMemberRole,
  GroupStatus,
} from "@/features/group/types/group.types";
import {
  createGroupHomeSnapshot,
  hasAssignedTeam,
} from "./group-session";

function createGroup(
  status: GroupStatus,
  myRole: GroupMemberRole = "PARTICIPANT",
): GroupDetail {
  return {
    groupId: 12,
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

describe("createGroupHomeSnapshot", () => {
  it.each([
    ["RECRUITING", "RECRUITING", 1, "recruiting"],
    ["BEFORE_FIRST_ROUND", "FIRST_PREPARING", 1, "round1-waiting"],
    ["FIRST_ROUND", "FIRST_IN_PROGRESS", 1, "round1-active"],
    ["VOTING", "SECOND_VOTING", 1, "voting"],
    ["VOTE_CLOSED", "SECOND_VOTING", 2, "round2-waiting"],
    ["BEFORE_SECOND_ROUND", "SECOND_PREPARING", 2, "round2-waiting"],
    ["SECOND_ROUND", "SECOND_IN_PROGRESS", 2, "round2-active"],
    ["FINISHED", "COMPLETED", 2, "completed"],
  ] as const)(
    "%s status를 홈 화면 상태로 변환한다",
    (status, currentStatus, round, scenario) => {
      const snapshot = createGroupHomeSnapshot(createGroup(status));

      expect(snapshot).toMatchObject({
        groupName: "API 그룹",
        currentStatus,
        round,
        scenario,
      });
    },
  );

  it("진행 중인 라운드에서만 관리자 종료 권한을 제공한다", () => {
    expect(
      createGroupHomeSnapshot(createGroup("FIRST_ROUND", "HOST")).permissions
        .canEndRound,
    ).toBe(true);
    expect(
      createGroupHomeSnapshot(createGroup("SECOND_ROUND", "HOST")).permissions
        .canEndRound,
    ).toBe(true);
    expect(
      createGroupHomeSnapshot(createGroup("VOTING", "HOST")).permissions
        .canEndRound,
    ).toBe(false);
  });

  it("관리자의 투표 종료 홈은 다음 단계 선택을 위해 기존 투표 상태를 유지한다", () => {
    expect(
      createGroupHomeSnapshot(createGroup("VOTE_CLOSED", "HOST")),
    ).toMatchObject({
      currentStatus: "SECOND_VOTING",
      round: 1,
      scenario: "voting",
    });
  });

  it.each([
    ["RECRUITING", false],
    ["BEFORE_FIRST_ROUND", false],
    ["FIRST_ROUND", true],
    ["VOTING", true],
    ["VOTE_CLOSED", true],
    ["BEFORE_SECOND_ROUND", false],
    ["SECOND_ROUND", true],
    ["FINISHED", false],
  ] as const)("%s status의 조 조회 여부를 반환한다", (status, expected) => {
    expect(hasAssignedTeam(status)).toBe(expected);
  });
});
