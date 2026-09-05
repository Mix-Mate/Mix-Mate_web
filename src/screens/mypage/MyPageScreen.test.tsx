import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MyPageScreen from "./MyPageScreen";
import HomeScreen from "../common/HomeScreen";
import * as authApi from "@/features/auth/api/auth.api";

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
  }),
}));

describe("MyPageScreen & Home Header MyPage Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("accessToken", "mock-token");
  });

  describe("HomeScreen Header MyPage Button", () => {
    it("홈 화면 우측 상단의 마이페이지 아이콘 버튼 클릭 시 /mypage로 이동한다", () => {
      render(<HomeScreen />);

      const myPageButton = screen.getByRole("button", {
        name: "마이페이지",
      });
      expect(myPageButton).toBeInTheDocument();

      fireEvent.click(myPageButton);
      expect(mockPush).toHaveBeenCalledWith("/mypage");
    });
  });

  describe("MyPageScreen Component", () => {
    it("로컬스토리지에 저장된 유저 정보(이름, 이메일)가 프로필 카드에 올바르게 렌더링된다", () => {
      window.localStorage.setItem("userName", "김철수");
      window.localStorage.setItem("email", "chulsoo@example.com");

      render(<MyPageScreen />);

      expect(screen.getByText("마이페이지")).toBeInTheDocument();
      expect(screen.getByText("김철수")).toBeInTheDocument();
      expect(screen.getByText("chulsoo@example.com")).toBeInTheDocument();
    });

    it("뒤로가기 버튼 클릭 시 router.back()이 호출된다", () => {
      render(<MyPageScreen />);

      const backButton = screen.getByRole("button", {
        name: "이전 화면으로 이동",
      });
      fireEvent.click(backButton);

      expect(mockBack).toHaveBeenCalled();
    });

    it("비밀번호 변경 메뉴 클릭 시 /change-password 경로로 이동한다", () => {
      render(<MyPageScreen />);

      const passwordButton = screen.getByRole("button", {
        name: /비밀번호 변경/,
      });
      fireEvent.click(passwordButton);

      expect(mockPush).toHaveBeenCalledWith("/change-password");
    });

    it("로그아웃 버튼 클릭 시 확인 모달이 열리고, 로그아웃 확정 시 세션 정리 후 /login으로 이동한다", async () => {
      const logoutSpy = vi
        .spyOn(authApi, "performLogout")
        .mockResolvedValue(undefined);

      render(<MyPageScreen />);

      // 1) 기타 섹션의 로그아웃 메뉴 클릭
      const logoutMenuButton = screen.getByRole("button", { name: /로그아웃/ });
      fireEvent.click(logoutMenuButton);

      // 2) 로그아웃 확인 모달 노출 확인
      expect(screen.getByText("로그아웃할까요?")).toBeInTheDocument();

      // 3) 모달 내 확인 버튼 클릭
      const logoutButtons = screen.getAllByRole("button", { name: "로그아웃" });
      const confirmButton = logoutButtons[logoutButtons.length - 1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(logoutSpy).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("회원탈퇴 버튼 클릭 시 확인 모달이 열리고, 탈퇴 확정 시 세션 정리 후 /login으로 이동한다", async () => {
      const withdrawSpy = vi
        .spyOn(authApi, "performWithdraw")
        .mockResolvedValue(undefined);

      render(<MyPageScreen />);

      fireEvent.click(screen.getByRole("button", { name: /회원탈퇴/ }));

      expect(screen.getByText("정말 탈퇴하시겠습니까?")).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

      await waitFor(() => {
        expect(withdrawSpy).toHaveBeenCalledWith("password123");
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("회원탈퇴 비밀번호를 입력하지 않으면 API를 호출하지 않고 안내한다", async () => {
      const withdrawSpy = vi
        .spyOn(authApi, "performWithdraw")
        .mockResolvedValue(undefined);

      render(<MyPageScreen />);

      fireEvent.click(screen.getByRole("button", { name: /회원탈퇴/ }));
      fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

      expect(await screen.findByText("비밀번호를 입력해주세요.")).toBeInTheDocument();
      expect(withdrawSpy).not.toHaveBeenCalled();
    });

    it("회원탈퇴 실패 시 모달에 에러 메시지를 표시한다", async () => {
      vi.spyOn(authApi, "performWithdraw").mockRejectedValue(
        new Error("이메일 또는 비밀번호가 일치하지 않습니다."),
      );

      render(<MyPageScreen />);

      fireEvent.click(screen.getByRole("button", { name: /회원탈퇴/ }));
      fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), {
        target: { value: "wrong-password" },
      });
      fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

      expect(
        await screen.findByText("비밀번호가 일치하지 않습니다."),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("이메일 또는 비밀번호가 일치하지 않습니다."),
      ).not.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalledWith("/login");
    });
  });
});
