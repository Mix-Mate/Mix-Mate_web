import { describe, expect, it, beforeEach } from "vitest";
import {
  readBlockedGroups,
  recordBlockedGroup,
  removeBlockedGroup,
  clearBlockedGroups,
} from "./blockedGroupsStorage";

describe("blockedGroupsStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("초기 상태에서는 빈 배열을 반환한다", () => {
    expect(readBlockedGroups()).toEqual([]);
  });

  it("차단 그룹을 기록하고 조회할 수 있다", () => {
    recordBlockedGroup({
      groupId: "10",
      groupName: "테스트 모임",
      reason: "비매너 행위",
    });

    const list = readBlockedGroups();
    expect(list).toHaveLength(1);
    expect(list[0].groupId).toBe("10");
    expect(list[0].groupName).toBe("테스트 모임");
    expect(list[0].reason).toBe("비매너 행위");
    expect(list[0].blockedAt).toBeDefined();
  });

  it("동일한 groupId가 다시 기록되면 정보를 갱신한다", () => {
    recordBlockedGroup({
      groupId: "10",
      groupName: "구버전 이름",
      reason: "이유1",
    });

    recordBlockedGroup({
      groupId: "10",
      groupName: "신버전 이름",
      reason: "이유2",
    });

    const list = readBlockedGroups();
    expect(list).toHaveLength(1);
    expect(list[0].groupName).toBe("신버전 이름");
    expect(list[0].reason).toBe("이유2");
  });

  it("removeBlockedGroup으로 특정 그룹을 제거할 수 있다", () => {
    recordBlockedGroup({ groupId: "1", groupName: "모임1" });
    recordBlockedGroup({ groupId: "2", groupName: "모임2" });

    expect(readBlockedGroups()).toHaveLength(2);

    removeBlockedGroup("1");
    const list = readBlockedGroups();
    expect(list).toHaveLength(1);
    expect(list[0].groupId).toBe("2");
  });

  it("clearBlockedGroups로 전체 차단 목록을 비울 수 있다", () => {
    recordBlockedGroup({ groupId: "1", groupName: "모임1" });
    recordBlockedGroup({ groupId: "2", groupName: "모임2" });

    clearBlockedGroups();
    expect(readBlockedGroups()).toEqual([]);
  });

  it("더미/기본 차단 사유는 저장 및 조회 시 undefined로 정제된다", () => {
    recordBlockedGroup({
      groupId: "5",
      groupName: "모임5",
      reason: "관리자에 의해 해당 그룹에서 차단되었습니다.",
    });

    const list = readBlockedGroups();
    expect(list[0].reason).toBeUndefined();
  });

  it("기존에 존재하는 상세 그룹명이 제네릭 '그룹' 이름으로 덮어씌워지지 않는다", () => {
    recordBlockedGroup({
      groupId: "99",
      groupName: "금요 러닝 크루",
      reason: "노쇼",
    });

    recordBlockedGroup({
      groupId: "99",
      groupName: "그룹",
    });

    const list = readBlockedGroups();
    expect(list[0].groupName).toBe("금요 러닝 크루");
    expect(list[0].reason).toBe("노쇼");
  });
});
