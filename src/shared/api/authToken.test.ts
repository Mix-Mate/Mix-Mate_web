import { beforeEach, describe, expect, it } from "vitest";
import {
  ensureValidAccessToken,
  getAccessToken,
  isTokenExpired,
  parseJwtPayload,
  setAuthTokens,
  withAuthHeaders,
} from "./authToken";

function createMockJwt(expSeconds: number, payloadExtra: Record<string, unknown> = {}) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: "123",
      exp: expSeconds,
      ...payloadExtra,
    }),
  );
  const signature = "fake-signature";
  return `${header}.${payload}.${signature}`;
}

describe("authToken 유틸리티", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = "accessToken=; max-age=0";
    document.cookie = "refreshToken=; max-age=0";
  });

  describe("parseJwtPayload & isTokenExpired", () => {
    it("빈 문자열 또는 null 토큰은 만료된 것으로 판단한다", () => {
      expect(isTokenExpired(null)).toBe(true);
      expect(isTokenExpired("")).toBe(true);
      expect(isTokenExpired("   ")).toBe(true);
    });

    it("3파트가 아닌 단순 문자열(mock 토큰)은 만료되지 않은 것으로 취급한다", () => {
      expect(isTokenExpired("mock-token-string")).toBe(false);
    });

    it("미래의 만료 시간을 가진 JWT는 만료되지 않은 것으로 판단한다", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1시간 후
      const validJwt = createMockJwt(futureExp);
      const parsed = parseJwtPayload(validJwt);
      expect(parsed?.exp).toBe(futureExp);
      expect(isTokenExpired(validJwt)).toBe(false);
    });

    it("과거의 만료 시간을 가진 JWT는 만료된 것으로 판단한다", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1시간 전
      const expiredJwt = createMockJwt(pastExp);
      expect(isTokenExpired(expiredJwt)).toBe(true);
    });
  });

  describe("ensureValidAccessToken & clearAuthTokens", () => {
    it("토큰이 없으면 false를 반환한다", () => {
      expect(ensureValidAccessToken()).toBe(false);
    });

    it("만료된 토큰이 저장되어 있으면 스토리지를 클리어하고 false를 반환한다", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      const expiredJwt = createMockJwt(pastExp);
      setAuthTokens({ accessToken: expiredJwt });
      localStorage.setItem("userName", "홍길동");

      const result = ensureValidAccessToken();
      expect(result).toBe(false);
      expect(getAccessToken()).toBeNull();
      expect(localStorage.getItem("userName")).toBeNull();
    });

    it("유효한 토큰이 저장되어 있으면 true를 반환한다", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 1000;
      const validJwt = createMockJwt(futureExp);
      setAuthTokens({ accessToken: validJwt });

      const result = ensureValidAccessToken();
      expect(result).toBe(true);
      expect(getAccessToken()).toBe(validJwt);
    });
  });

  describe("withAuthHeaders", () => {
    it("토큰이 있을 때 Authorization 헤더를 추가한다", () => {
      setAuthTokens({ accessToken: "my-token" });
      const headers = withAuthHeaders({ "Content-Type": "application/json" });
      expect(headers).toEqual({
        "Content-Type": "application/json",
        Authorization: "Bearer my-token",
      });
    });

    it("토큰이 없을 때 기존 헤더를 그대로 반환한다", () => {
      const headers = withAuthHeaders({ "Content-Type": "application/json" });
      expect(headers).toEqual({ "Content-Type": "application/json" });
    });
  });
});
