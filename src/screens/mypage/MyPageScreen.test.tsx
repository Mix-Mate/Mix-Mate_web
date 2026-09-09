import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MyPageScreen from "./MyPageScreen";
import HomeScreen from "../common/HomeScreen";
import * as authApi from "@/features/auth/api/auth.api";
import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";

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

vi.mock("@/shared/api/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

describe("MyPageScreen & Home Header MyPage Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("accessToken", "mock-token");
    vi.mocked(apiFetch).mockResolvedValue(
      new Response("수정 성공", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      }),
    );
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

    it("회원탈퇴 비밀번호 입력값의 앞뒤 공백은 제거해서 전송한다", async () => {
      const withdrawSpy = vi
        .spyOn(authApi, "performWithdraw")
        .mockResolvedValue(undefined);

      render(<MyPageScreen />);

      fireEvent.click(screen.getByRole("button", { name: /회원탈퇴/ }));
      fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), {
        target: { value: " password123 " },
      });
      fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

      await waitFor(() => {
        expect(withdrawSpy).toHaveBeenCalledWith("password123");
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("자동완성으로 React state가 갱신되지 않아도 input의 실제 값으로 회원탈퇴를 요청한다", async () => {
      const withdrawSpy = vi
        .spyOn(authApi, "performWithdraw")
        .mockResolvedValue(undefined);

      render(<MyPageScreen />);

      fireEvent.click(screen.getByRole("button", { name: /회원탈퇴/ }));
      const input = screen.getByPlaceholderText(
        "비밀번호 입력",
      ) as HTMLInputElement;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set?.call(input, "password123");

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

    it("회원탈퇴 401 실패가 로그인 필요 메시지여도 비밀번호 오류로 표시한다", async () => {
      vi.spyOn(authApi, "performWithdraw").mockRejectedValue(
        new authApi.AuthApiError("로그인이 필요합니다.", 401, "UNAUTHORIZED"),
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
      expect(screen.queryByText("로그인이 필요합니다.")).not.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalledWith("/login");
    });

    describe("이름 수정 (Edit Username)", () => {
      it("이름 수정 버튼 클릭 시 모달이 열리고 현재 이름이 기본값으로 채워진다", () => {
        window.localStorage.setItem("userName", "홍길동");
        render(<MyPageScreen />);

        const editButton = screen.getByRole("button", { name: "이름 수정" });
        expect(editButton).toBeInTheDocument();

        fireEvent.click(editButton);

        expect(screen.getByText("이름 수정")).toBeInTheDocument();
        const input = screen.getByPlaceholderText(
          "2~10자 이내 입력",
        ) as HTMLInputElement;
        expect(input.value).toBe("홍길동");
        expect(screen.getByText("3/10")).toBeInTheDocument();
      });

      it("이름을 2자 미만으로 입력하거나 공백만 입력 시 에러 메시지를 표시한다", async () => {
        window.localStorage.setItem("userName", "홍길동");
        render(<MyPageScreen />);

        fireEvent.click(screen.getByRole("button", { name: "이름 수정" }));
        const input = screen.getByPlaceholderText("2~10자 이내 입력");

        fireEvent.change(input, { target: { value: " " } });
        fireEvent.click(screen.getByRole("button", { name: "저장" }));

        expect(
          await screen.findByText("이름을 입력해주세요."),
        ).toBeInTheDocument();

        fireEvent.change(input, { target: { value: "김" } });
        fireEvent.click(screen.getByRole("button", { name: "저장" }));

        expect(
          await screen.findByText("이름은 2자 이상 10자 이하로 입력해주세요."),
        ).toBeInTheDocument();
      });

      it("허용되지 않은 특수문자 입력 시 에러 메시지를 표시한다", async () => {
        window.localStorage.setItem("userName", "홍길동");
        render(<MyPageScreen />);

        fireEvent.click(screen.getByRole("button", { name: "이름 수정" }));
        const input = screen.getByPlaceholderText("2~10자 이내 입력");

        fireEvent.change(input, { target: { value: "홍길동!@" } });
        fireEvent.click(screen.getByRole("button", { name: "저장" }));

        expect(
          await screen.findByText(
            "이름에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
          ),
        ).toBeInTheDocument();
      });

      it("유효한 이름 입력 후 저장 시 updateUserNameApi가 호출되고 로컬스토리지 및 화면이 갱신되며 토스트가 노출된다", async () => {
        window.localStorage.setItem("userName", "홍길동");
        render(<MyPageScreen />);

        fireEvent.click(screen.getByRole("button", { name: "이름 수정" }));
        const input = screen.getByPlaceholderText("2~10자 이내 입력");

        fireEvent.change(input, { target: { value: "이몽룡" } });
        fireEvent.click(screen.getByRole("button", { name: "저장" }));

        expect(await screen.findByText("이름이 변경되었습니다.")).toBeInTheDocument();
        expect(apiFetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/api/v1/auth/name`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userName: "이몽룡" }),
          },
        );
        expect(window.localStorage.getItem("userName")).toBe("이몽룡");
        expect(screen.getByText("이몽룡")).toBeInTheDocument();
      });

      it("이름 수정 API가 400 에러를 반환하면 모달 내에 에러 메시지가 노출되고 모달이 유지된다", async () => {
        vi.mocked(apiFetch).mockResolvedValue(
          Response.json(
            {
              code: "INVALID_PARAMETER",
              message: "유효하지 않은 요청입니다.",
              errors: {
                userName: "이미 사용 중인 이름입니다.",
              },
            },
            { status: 400 },
          ),
        );

        window.localStorage.setItem("userName", "홍길동");
        render(<MyPageScreen />);

        fireEvent.click(screen.getByRole("button", { name: "이름 수정" }));
        const input = screen.getByPlaceholderText("2~10자 이내 입력");

        fireEvent.change(input, { target: { value: "중복이름" } });
        fireEvent.click(screen.getByRole("button", { name: "저장" }));

        expect(
          await screen.findByText("이미 사용 중인 이름입니다."),
        ).toBeInTheDocument();
        expect(window.localStorage.getItem("userName")).toBe("홍길동");
        expect(screen.getByPlaceholderText("2~10자 이내 입력")).toBeInTheDocument();
      });

      it("이름 수정 API가 401 에러를 반환하면 인증 에러 메시지가 노출된다", async () => {
        vi.mocked(apiFetch).mockResolvedValue(
          Response.json(
            {
              code: "UNAUTHORIZED",
              message: "로그인이 필요합니다.",
            },
            { status: 401 },
          ),
        );

        window.localStorage.setItem("userName", "홍길동");
        render(<MyPageScreen />);

        fireEvent.click(screen.getByRole("button", { name: "이름 수정" }));
        const input = screen.getByPlaceholderText("2~10자 이내 입력");

        fireEvent.change(input, { target: { value: "새이름" } });
        fireEvent.click(screen.getByRole("button", { name: "저장" }));

        expect(
          await screen.findByText("로그인이 필요합니다."),
        ).toBeInTheDocument();
        expect(window.localStorage.getItem("userName")).toBe("홍길동");
        expect(screen.getByPlaceholderText("2~10자 이내 입력")).toBeInTheDocument();
      });

      it("수정 취소 버튼을 누르면 모달이 닫히고 기존 이름이 유지된다", () => {
        window.localStorage.setItem("userName", "홍길동");
        render(<MyPageScreen />);

        fireEvent.click(screen.getByRole("button", { name: "이름 수정" }));
        const input = screen.getByPlaceholderText("2~10자 이내 입력");

        fireEvent.change(input, { target: { value: "변학도" } });
        fireEvent.click(screen.getByRole("button", { name: "취소" }));

        expect(screen.queryByPlaceholderText("2~10자 이내 입력")).not.toBeInTheDocument();
        expect(window.localStorage.getItem("userName")).toBe("홍길동");
        expect(screen.getByText("홍길동")).toBeInTheDocument();
      });
    });
  });
});
