import { describe, expect, it } from "vitest";
import { getGroupEntryRoute, isGroupHost } from "./group-entry-route";

describe("group-entry-route", () => {
  describe("isGroupHost", () => {
    it("HOST이면 true를 반환한다", () => {
      expect(isGroupHost("HOST")).toBe(true);
      expect(isGroupHost("host")).toBe(true);
      expect(isGroupHost(" HOST ")).toBe(true);
    });

    it("PARTICIPANT이거나 null/undefined이면 false를 반환한다", () => {
      expect(isGroupHost("PARTICIPANT")).toBe(false);
      expect(isGroupHost(null)).toBe(false);
      expect(isGroupHost(undefined)).toBe(false);
    });
  });

  describe("getGroupEntryRoute", () => {
    it("일반 참가자(PARTICIPANT)는 기본적으로 사용자 홈(/groups/:id)으로 이동한다", () => {
      expect(getGroupEntryRoute("10", "PARTICIPANT", "FIRST_ROUND")).toBe(
        "/groups/10",
      );
    });

    it("일반 참가자(PARTICIPANT)가 VOTING 상태일 때는 MVP 투표 화면(/groups/:id/votes/mvp)으로 이동한다", () => {
      expect(getGroupEntryRoute("10", "PARTICIPANT", "VOTING")).toBe(
        "/groups/10/votes/mvp",
      );
    });

    it("관리자(HOST)가 RECRUITING 상태일 때는 모집 관리 화면(/groups/:id/admin/recruitment)으로 이동한다", () => {
      expect(getGroupEntryRoute("10", "HOST", "RECRUITING")).toBe(
        "/groups/10/admin/recruitment",
      );
    });

    it("관리자(HOST)도 VOTING 상태로 재진입하면 MVP 투표 화면(/groups/:id/votes/mvp)으로 이동한다", () => {
      expect(getGroupEntryRoute("10", "HOST", "VOTING")).toBe(
        "/groups/10/votes/mvp",
      );
    });

    it("관리자(HOST)의 기본 상태는 관리자 홈(/groups/:id/admin)으로 이동한다", () => {
      expect(getGroupEntryRoute("10", "HOST", "FIRST_ROUND")).toBe(
        "/groups/10/admin",
      );
    });
  });
});
