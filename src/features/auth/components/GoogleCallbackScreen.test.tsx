import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GoogleCallbackScreen from "./GoogleCallbackScreen";
import { loginWithGoogleApi } from "../api/auth.api";
import { GOOGLE_OAUTH_STATE_KEY } from "../utils/google-auth";
import { POST_LOGIN_REDIRECT_KEY } from "../utils/post-login-redirect";

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
    loginWithGoogleApi: vi.fn(),
  };
});

describe("GoogleCallbackScreen 로그인 후 이동", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
    mockSearchParams = new URLSearchParams();
  });

  it("초대 링크에서 시작한 구글 로그인은 성공 후 원래 초대 링크로 복귀한다", async () => {
    const validState = "valid-google-state";
    const invitePath = "/groups/join?inviteCode=ABC123";
    window.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, validState);
    window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, invitePath);
    mockSearchParams = new URLSearchParams(
      `code=google-auth-code&state=${validState}`,
    );

    vi.mocked(loginWithGoogleApi).mockResolvedValueOnce({
      userId: 7,
      email: "google@example.com",
      userName: "구글사용자",
      accessToken: "google-access-token",
      refreshToken: "google-refresh-token",
    });

    render(<GoogleCallbackScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(invitePath);
    });
    expect(window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)).toBeNull();
  });
});
