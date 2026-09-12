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

describe("loginWithKakaoApi", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const KAKAO_AUTH_URL = `${API_BASE_URL}/api/v1/auth/oauth/kakao`;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("200 성공 시 사용자 정보와 토큰을 반환한다", async () => {
    const mockSuccessResponse = {
      userId: 1,
      email: "kakao@example.com",
      userName: "카카오유저",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };

    fetchMock.mockResolvedValueOnce(jsonResponse(200, mockSuccessResponse));

    const { loginWithKakaoApi } = await importAuthApi();
    const result = await loginWithKakaoApi("kakao-auth-code-123");

    expect(result).toEqual(mockSuccessResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      KAKAO_AUTH_URL,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: "kakao-auth-code-123" }),
      }),
    );
  });

  it("409 충돌(EMAIL_CONFLICTED) 시 적절한 에러 메시지와 코드를 발생시킨다", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(409, {
        code: "EMAIL_CONFLICTED",
        message: "이미 가입된 이메일입니다. 기존 방법으로 로그인해주세요.",
      }),
    );

    const { loginWithKakaoApi } = await importAuthApi();

    await expect(loginWithKakaoApi("kakao-auth-code-123")).rejects.toMatchObject(
      {
        status: 409,
        code: "EMAIL_CONFLICTED",
        message: "이미 가입된 이메일입니다. 기존 방법으로 로그인해주세요.",
      },
    );
  });

  it("400 에러 시 서버 에러 메시지를 포함한 AuthApiError를 발생시킨다", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, {
        code: "OAUTH_LOGIN_FAILED",
        message: "인가 코드가 유효하지 않습니다.",
      }),
    );

    const { loginWithKakaoApi } = await importAuthApi();

    await expect(loginWithKakaoApi("invalid-code")).rejects.toMatchObject({
      status: 400,
      code: "OAUTH_LOGIN_FAILED",
      message: "인가 코드가 유효하지 않습니다.",
    });
  });
});

