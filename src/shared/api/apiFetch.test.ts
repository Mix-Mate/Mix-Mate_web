import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "./apiBaseUrl";

const API_URL = `${API_BASE_URL}/api/v1/groups/1/teams`;
const REISSUE_URL = `${API_BASE_URL}/api/v1/auth/reissue`;

function jsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function authHeaderOf(call: [string, RequestInit]) {
  const headers = call[1].headers as Record<string, string>;
  return headers.Authorization;
}

/** 모듈 안의 재발급 in-flight 상태가 테스트끼리 새지 않도록 매번 새로 불러온다. */
async function importApiFetch() {
  vi.resetModules();
  return (await import("./apiFetch")).apiFetch;
}

describe("apiFetch 401 재발급", () => {
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

  it("401을 받으면 재발급 후 새 토큰으로 같은 요청을 재시도한다", async () => {
    window.localStorage.setItem("accessToken", "old-token");

    fetchMock
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: "new-token" }))
      .mockResolvedValueOnce(jsonResponse(200, { teams: [] }));

    const apiFetch = await importApiFetch();
    const response = await apiFetch(API_URL);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const calls = fetchMock.mock.calls as [string, RequestInit][];
    expect(calls[0][0]).toBe(API_URL);
    expect(authHeaderOf(calls[0])).toBe("Bearer old-token");

    expect(calls[1][0]).toBe(REISSUE_URL);
    expect(calls[1][1].method).toBe("POST");

    // 재시도는 재발급받은 새 토큰을 실어야 한다.
    expect(calls[2][0]).toBe(API_URL);
    expect(authHeaderOf(calls[2])).toBe("Bearer new-token");
    expect(window.localStorage.getItem("accessToken")).toBe("new-token");
  });

  it("동시에 여러 요청이 401을 받아도 재발급은 한 번만 호출한다", async () => {
    window.localStorage.setItem("accessToken", "old-token");

    fetchMock.mockImplementation((url: string) => {
      if (url === REISSUE_URL) {
        return Promise.resolve(jsonResponse(200, { accessToken: "new-token" }));
      }
      const token = window.localStorage.getItem("accessToken");
      return Promise.resolve(
        token === "new-token" ? jsonResponse(200) : jsonResponse(401),
      );
    });

    const apiFetch = await importApiFetch();
    const responses = await Promise.all([
      apiFetch(API_URL),
      apiFetch(API_URL),
      apiFetch(API_URL),
    ]);

    expect(responses.every((response) => response.status === 200)).toBe(true);

    const reissueCalls = (fetchMock.mock.calls as [string][]).filter(
      ([url]) => url === REISSUE_URL,
    );
    expect(reissueCalls).toHaveLength(1);
  });

  it("재발급에 실패하면 토큰을 정리하고 원래 401을 그대로 돌려준다", async () => {
    window.localStorage.setItem("accessToken", "old-token");
    window.localStorage.setItem("refreshToken", "stale-refresh");

    fetchMock
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(jsonResponse(401));

    const apiFetch = await importApiFetch();
    const response = await apiFetch(API_URL);

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(window.localStorage.getItem("accessToken")).toBeNull();
    expect(window.localStorage.getItem("refreshToken")).toBeNull();
  });

  it("토큰 없이 보낸 요청이 401이면 재발급을 시도하지 않는다", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401));

    const apiFetch = await importApiFetch();
    const response = await apiFetch(API_URL);

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("401이 아니면 재발급 없이 응답을 그대로 돌려준다", async () => {
    window.localStorage.setItem("accessToken", "old-token");
    fetchMock.mockResolvedValueOnce(jsonResponse(403));

    const apiFetch = await importApiFetch();
    const response = await apiFetch(API_URL);

    expect(response.status).toBe(403);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("요청이 나가 있는 사이 다른 요청이 갱신해두면 재발급 없이 재시도한다", async () => {
    window.localStorage.setItem("accessToken", "old-token");

    fetchMock
      // 첫 요청이 401로 돌아오기 직전에 다른 요청이 토큰을 갱신해둔 상황을 만든다.
      .mockImplementationOnce(() => {
        window.localStorage.setItem("accessToken", "new-token");
        return Promise.resolve(jsonResponse(401));
      })
      .mockResolvedValueOnce(jsonResponse(200));

    const apiFetch = await importApiFetch();
    const response = await apiFetch(API_URL);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const calls = fetchMock.mock.calls as [string, RequestInit][];
    expect(calls.some(([url]) => url === REISSUE_URL)).toBe(false);
    expect(authHeaderOf(calls[1])).toBe("Bearer new-token");
  });
});
