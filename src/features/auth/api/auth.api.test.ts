import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";

const WITHDRAW_URL = `${API_BASE_URL}/api/v1/auth/withdraw`;

function jsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function emptyResponse(status: number) {
  return new Response(null, { status });
}

function authHeaderOf(call: [string, RequestInit]) {
  const headers = call[1].headers as Record<string, string>;
  return headers.Authorization;
}

async function importAuthApi() {
  vi.resetModules();
  return await import("./auth.api");
}

describe("withdrawApi", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("비밀번호 오류로 401을 받아도 저장된 토큰을 제거하지 않는다", async () => {
    window.localStorage.setItem("accessToken", "access-token");
    window.localStorage.setItem("refreshToken", "refresh-token");
    fetchMock.mockResolvedValueOnce(
      jsonResponse(401, {
        code: "UNAUTHORIZED",
        message: "로그인이 필요합니다.",
      }),
    );

    const { withdrawApi } = await importAuthApi();

    await expect(withdrawApi({ password: "wrong-password" })).rejects.toThrow(
      "로그인이 필요합니다.",
    );

    expect(window.localStorage.getItem("accessToken")).toBe("access-token");
    expect(window.localStorage.getItem("refreshToken")).toBe("refresh-token");
  });

  it("실패 후 다시 시도해도 Authorization 헤더를 유지한다", async () => {
    window.localStorage.setItem("accessToken", "access-token");
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse(401, {
          code: "UNAUTHORIZED",
          message: "로그인이 필요합니다.",
        }),
      )
      .mockResolvedValueOnce(emptyResponse(204));

    const { withdrawApi } = await importAuthApi();

    await expect(withdrawApi({ password: "wrong-password" })).rejects.toThrow();
    await expect(
      withdrawApi({ password: "correct-password" }),
    ).resolves.toBe("");

    const calls = fetchMock.mock.calls as [string, RequestInit][];
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toBe(WITHDRAW_URL);
    expect(calls[1][0]).toBe(WITHDRAW_URL);
    expect(authHeaderOf(calls[0])).toBe("Bearer access-token");
    expect(authHeaderOf(calls[1])).toBe("Bearer access-token");
    expect(calls[1][1].body).toBe(
      JSON.stringify({ password: "correct-password" }),
    );
  });
});
