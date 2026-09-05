import { describe, expect, it, beforeEach } from "vitest";
import {
  readBlockedGroups,
  recordBlockedGroup,
  removeBlockedGroup,
  clearBlockedGroups,
  saveKnownGroupName,
  repairBlockedGroupNames,
  isDummyGroupName,
  getKnownGroupIds,
  getBlacklistedGroupIds,
  isDismissedBlockedGroup,
  dismissBlockedGroup,
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

  it("isDummyGroupName이 더미 이름과 유효 이름을 올바르게 식별한다", () => {
    expect(isDummyGroupName("")).toBe(true);
    expect(isDummyGroupName("차단된 그룹")).toBe(true);
    expect(isDummyGroupName("차단된그룹")).toBe(true);
    expect(isDummyGroupName("그룹")).toBe(true);
    expect(isDummyGroupName("모임")).toBe(true);
    expect(isDummyGroupName("홍대 보드게임 크루")).toBe(false);
    expect(isDummyGroupName("스터디 1기")).toBe(false);
  });

  it("기존에 존재하는 상세 그룹명이 제네릭 '그룹' 또는 '차단된 그룹' 이름으로 덮어씌워지지 않는다", () => {
    recordBlockedGroup({
      groupId: "99",
      groupName: "금요 러닝 크루",
      reason: "노쇼",
    });

    recordBlockedGroup({
      groupId: "99",
      groupName: "그룹",
    });

    recordBlockedGroup({
      groupId: "99",
      groupName: "차단된 그룹",
    });

    const list = readBlockedGroups();
    expect(list[0].groupName).toBe("금요 러닝 크루");
    expect(list[0].reason).toBe("노쇼");
  });

  it("더미 그룹명이 들어왔을 때 알려진 그룹명 캐시(saveKnownGroupName)에서 원래 이름을 찾아 저장한다", () => {
    saveKnownGroupName("101", "주말 보드게임 모임");

    recordBlockedGroup({
      groupId: "101",
      groupName: "차단된 그룹",
      reason: "지각",
    });

    const list = readBlockedGroups();
    expect(list[0].groupName).toBe("주말 보드게임 모임");
  });

  it("스토리지에 기존 더미 '차단된 그룹'으로 저장되어 있던 항목이 readBlockedGroups 또는 repairBlockedGroupNames 시 복원된다", () => {
    // 강제로 로컬 스토리지에 더미 데이터 직접 삽입
    localStorage.setItem(
      "mixmate_blocked_groups",
      JSON.stringify([
        {
          groupId: "202",
          groupName: "차단된 그룹",
          reason: "규정 위반",
        },
      ]),
    );

    // 알려진 캐시에 이름 등록
    saveKnownGroupName("202", "알고리즘 스터디");

    // readBlockedGroups 호출 시 자동 자가 치유
    const list = readBlockedGroups();
    expect(list[0].groupName).toBe("알고리즘 스터디");

    // localStorage도 갱신되었는지 확인
    const rawAfter = JSON.parse(localStorage.getItem("mixmate_blocked_groups") || "[]");
    expect(rawAfter[0].groupName).toBe("알고리즘 스터디");

    // repairBlockedGroupNames 직접 호출 테스트
    repairBlockedGroupNames([{ groupId: "202", groupName: "새 알고리즘 스터디" }]);
    expect(readBlockedGroups()[0].groupName).toBe("새 알고리즘 스터디");
  });

  it("getKnownGroupIds 및 getBlacklistedGroupIds가 저장된 그룹 ID 목록을 올바르게 반환한다", () => {
    saveKnownGroupName("301", "모임301");
    saveKnownGroupName("302", "모임302");
    localStorage.setItem("mixmate:group-blacklist:401", JSON.stringify([]));
    localStorage.setItem("mixmate_blacklist_402", JSON.stringify([]));

    const knownIds = getKnownGroupIds();
    expect(knownIds).toContain("301");
    expect(knownIds).toContain("302");

    const blacklistedIds = getBlacklistedGroupIds();
    expect(blacklistedIds).toContain("401");
    expect(blacklistedIds).toContain("402");
  });

  it("removeBlockedGroup은 dismiss하지 않고 목록에서만 제거하며, dismissBlockedGroup 호출 시에만 dismiss된다", () => {
    recordBlockedGroup({ groupId: "501", groupName: "모임501" });
    expect(isDismissedBlockedGroup("501")).toBe(false);

    // 단순 removeBlockedGroup은 dismiss를 발생시키지 않는다
    removeBlockedGroup("501");
    expect(readBlockedGroups()).toHaveLength(0);
    expect(isDismissedBlockedGroup("501")).toBe(false);

    // 사용자가 명시적으로 dismiss한 경우에만 true
    dismissBlockedGroup("501");
    expect(isDismissedBlockedGroup("501")).toBe(true);

    // 다시 recordBlockedGroup 호출 시 dismiss 해제
    recordBlockedGroup({ groupId: "501", groupName: "모임501" });
    expect(isDismissedBlockedGroup("501")).toBe(false);
  });
});
