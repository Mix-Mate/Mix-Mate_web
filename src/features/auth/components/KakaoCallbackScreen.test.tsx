import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import KakaoCallbackScreen from "./KakaoCallbackScreen";
import { loginWithKakaoApi, AuthApiError } from "../api/auth.api";
import { KAKAO_OAUTH_STATE_KEY } from "../utils/kakao-auth";

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("../api/auth.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/auth.api")>();
  return {
    ...actual,
    loginWithKakaoApi: vi.fn(),
  };
});

describe("KakaoCallbackScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
    mockSearchParams = new URLSearchParams();
  });

  it("state가 불일치하면 '비정상적인 접근입니다.' 메시지와 함께 /login으로 이동한다", async () => {
    window.sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, "saved-state-123");
    mockSearchParams = new URLSearchParams("code=auth-code&state=wrong-state");

    render(<KakaoCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/login?toast="),
      );
      expect(window.sessionStorage.getItem("authToast")).toBe(
        "비정상적인 접근입니다.",
      );
    });

    expect(loginWithKakaoApi).not.toHaveBeenCalled();
  });

  it("code 또는 state가 없으면 /login으로 이동한다", async () => {
    mockSearchParams = new URLSearchParams("code=auth-code"); // state 없음

    render(<KakaoCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/login?toast="),
      );
      expect(window.sessionStorage.getItem("authToast")).toBe(
        "비정상적인 접근입니다.",
      );
    });
  });

  it("카카오 인가 에러(error 파라미터)가 있으면 /login으로 이동한다", async () => {
    mockSearchParams = new URLSearchParams(
      "error=access_denied&error_description=User+denied+access",
    );

    render(<KakaoCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/login?toast="),
      );
      expect(window.sessionStorage.getItem("authToast")).toBe(
        "User denied access",
      );
    });
  });

  it("정상 인가 코드와 state 일치 시 로그인 성공 후 /home으로 이동한다", async () => {
    const validState = "valid-state-abc";
    window.sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, validState);
    mockSearchParams = new URLSearchParams(
      `code=auth-code-123&state=${validState}`,
    );

    const mockLoginResponse = {
      userId: 42,
      email: "kakao@example.com",
      userName: "카카오사용자",
      accessToken: "access-token-456",
      refreshToken: "refresh-token-789",
    };

    vi.mocked(loginWithKakaoApi).mockResolvedValueOnce(mockLoginResponse);

    render(<KakaoCallbackScreen />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("카카오 로그인 처리 중")).toBeInTheDocument();

    await waitFor(() => {
      expect(loginWithKakaoApi).toHaveBeenCalledWith("auth-code-123");
      expect(mockReplace).toHaveBeenCalledWith("/home");
      expect(window.localStorage.getItem("accessToken")).toBe(
        "access-token-456",
      );
      expect(window.localStorage.getItem("refreshToken")).toBe(
        "refresh-token-789",
      );
      expect(window.localStorage.getItem("userName")).toBe("카카오사용자");
      expect(window.localStorage.getItem("userId")).toBe("42");
      expect(window.localStorage.getItem("email")).toBe("kakao@example.com");
    });

    // state가 사용 후 삭제되었는지 확인
    expect(window.sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY)).toBeNull();
  });

  it("409 EMAIL_CONFLICTED 에러 발생 시 안내 메시지와 함께 /login으로 이동한다", async () => {
    const validState = "valid-state-409";
    window.sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, validState);
    mockSearchParams = new URLSearchParams(
      `code=auth-code-409&state=${validState}`,
    );

    vi.mocked(loginWithKakaoApi).mockRejectedValueOnce(
      new AuthApiError(
        "이미 가입된 이메일입니다. 기존 방법으로 로그인해주세요.",
        409,
        "EMAIL_CONFLICTED",
      ),
    );

    render(<KakaoCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/login?toast="),
      );
      expect(window.sessionStorage.getItem("authToast")).toBe(
        "이미 가입된 이메일입니다. 기존 방법으로 로그인해주세요.",
      );
    });
  });

  it("400 일반 에러 발생 시 해당 에러 메시지와 함께 /login으로 이동한다", async () => {
    const validState = "valid-state-400";
    window.sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, validState);
    mockSearchParams = new URLSearchParams(
      `code=auth-code-400&state=${validState}`,
    );

    vi.mocked(loginWithKakaoApi).mockRejectedValueOnce(
      new AuthApiError("인가 코드가 만료되었습니다.", 400, "OAUTH_LOGIN_FAILED"),
    );

    render(<KakaoCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/login?toast="),
      );
      expect(window.sessionStorage.getItem("authToast")).toBe(
        "인가 코드가 만료되었습니다.",
      );
    });
  });
});
