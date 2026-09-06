import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";

const WITHDRAW_URL = `${API_BASE_URL}/api/v1/auth/withdraw`;
const REISSUE_URL = `${API_BASE_URL}/api/v1/auth/reissue`;

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

  it("access token 만료 응답을 받으면 재발급 후 회원탈퇴 요청을 재시도한다", async () => {
    window.localStorage.setItem("accessToken", "old-token");
    window.localStorage.setItem("refreshToken", "refresh-token");

    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { code: "UNAUTHORIZED" }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: "new-token" }))
      .mockResolvedValueOnce(emptyResponse(204));

    const { withdrawApi } = await importAuthApi();

    await expect(
      withdrawApi({ password: "correct-password" }),
    ).resolves.toBe("");

    const calls = fetchMock.mock.calls as [string, RequestInit][];
    expect(calls).toHaveLength(3);
    expect(calls[0][0]).toBe(WITHDRAW_URL);
    expect(calls[0][1].method).toBe("DELETE");
    expect(authHeaderOf(calls[0])).toBe("Bearer old-token");
    expect(calls[0][1].body).toBe(
      JSON.stringify({ password: "correct-password" }),
    );

    expect(calls[1][0]).toBe(REISSUE_URL);

    expect(calls[2][0]).toBe(WITHDRAW_URL);
    expect(calls[2][1].method).toBe("DELETE");
    expect(authHeaderOf(calls[2])).toBe("Bearer new-token");
    expect(calls[2][1].body).toBe(
      JSON.stringify({ password: "correct-password" }),
    );
  });
});
