import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";
import { loginApi } from "../api/auth.api";

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
    loginApi: vi.fn(),
  };
});

describe("LoginForm 로그인 후 이동", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  const submitLogin = () => {
    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "member@example.com" },
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
  };

  const mockLoginSuccess = () => {
    vi.mocked(loginApi).mockResolvedValueOnce({
      userId: 1,
      email: "member@example.com",
      userName: "멤버",
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  };

  it("초대 링크 복귀 주소가 있으면 로그인 성공 후 해당 주소로 이동한다", async () => {
    mockSearchParams = new URLSearchParams({
      next: "/groups/join?inviteCode=ABC123",
    });
    mockLoginSuccess();

    render(<LoginForm />);
    submitLogin();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        "/groups/join?inviteCode=ABC123",
      );
    });
  });

  it("복귀 주소가 없으면 기존처럼 홈으로 이동한다", async () => {
    mockLoginSuccess();

    render(<LoginForm />);
    submitLogin();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });
  });

  it("외부 복귀 주소는 무시하고 홈으로 이동한다", async () => {
    mockSearchParams = new URLSearchParams({
      next: "https://evil.example/phishing",
    });
    mockLoginSuccess();

    render(<LoginForm />);
    submitLogin();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });
  });
});
