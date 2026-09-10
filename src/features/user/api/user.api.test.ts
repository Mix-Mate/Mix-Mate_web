import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { apiFetch } from "@/shared/api/apiFetch";
import {
  updateUserNameApi,
  UserApiError,
  validateUserName,
} from "./user.api";

vi.mock("@/shared/api/apiFetch", () => ({
  apiFetch: vi.fn(),
}));

describe("user.api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateUserName", () => {
    it("공백만 있는 문자열은 에러를 반환한다", () => {
      expect(validateUserName("   ")).toBe("이름을 입력해주세요.");
      expect(validateUserName("")).toBe("이름을 입력해주세요.");
    });

    it("2자 미만인 경우 에러를 반환한다", () => {
      expect(validateUserName("가")).toBe(
        "이름은 2자 이상 10자 이하로 입력해주세요.",
      );
      expect(validateUserName(" A ")).toBe(
        "이름은 2자 이상 10자 이하로 입력해주세요.",
      );
    });

    it("10자를 초과하는 경우 에러를 반환한다", () => {
      expect(validateUserName("일이삼사오육칠팔구십일")).toBe(
        "이름은 2자 이상 10자 이하로 입력해주세요.",
      );
    });

    it("허용되지 않은 특수문자가 포함된 경우 에러를 반환한다", () => {
      expect(validateUserName("홍길동!@#")).toBe(
        "이름에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
      );
    });

    it("2~10자의 유효한 이름은 null을 반환한다", () => {
      expect(validateUserName("홍길동")).toBeNull();
      expect(validateUserName("Mix Mate")).toBeNull();
      expect(validateUserName("김_철-수.1")).toBeNull();
    });
  });

  describe("updateUserNameApi", () => {
    it("유효하지 않은 이름을 전달하면 API 호출 없이 에러를 throw한다", async () => {
      await expect(updateUserNameApi(" ")).rejects.toThrow(
        "이름을 입력해주세요.",
      );
      await expect(updateUserNameApi("가")).rejects.toThrow(
        "이름은 2자 이상 10자 이하로 입력해주세요.",
      );
      expect(apiFetch).not.toHaveBeenCalled();
    });

    it("유효한 이름을 전달하면 PATCH /api/v1/auth/name에 trimmed된 userName을 전송하고 성공 응답(text)을 반환한다", async () => {
      vi.mocked(apiFetch).mockResolvedValue(
        new Response("이름이 성공적으로 수정되었습니다.", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        }),
      );

      const response = await updateUserNameApi("  새이름  ");

      expect(apiFetch).toHaveBeenCalledExactlyOnceWith(
        `${API_BASE_URL}/api/v1/auth/name`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userName: "새이름" }),
        },
      );
      expect(response).toBe("이름이 성공적으로 수정되었습니다.");
    });

    it("JSON 형태의 성공 응답도 올바르게 반환한다", async () => {
      vi.mocked(apiFetch).mockResolvedValue(
        Response.json({
          userName: "새이름",
          message: "이름이 성공적으로 변경되었습니다.",
        }),
      );

      const response = await updateUserNameApi("새이름");
      expect(response).toEqual({
        userName: "새이름",
        message: "이름이 성공적으로 변경되었습니다.",
      });
    });

    it("400 Bad Request 시 errors.userName이 있으면 해당 메시지를 throw한다", async () => {
      vi.mocked(apiFetch).mockResolvedValue(
        Response.json(
          {
            code: "INVALID_PARAMETER",
            message: "유효하지 않은 파라미터입니다.",
            errors: {
              userName: "이미 사용 중인 이름입니다.",
            },
          },
          { status: 400 },
        ),
      );

      const request = updateUserNameApi("중복이름");

      await expect(request).rejects.toThrow("이미 사용 중인 이름입니다.");
      await expect(request).rejects.toBeInstanceOf(UserApiError);
      await expect(request).rejects.toMatchObject({
        status: 400,
        code: "INVALID_PARAMETER",
        fieldErrors: {
          userName: "이미 사용 중인 이름입니다.",
        },
      });
    });

    it("400 Bad Request 시 errors.userName이 없고 message만 있는 경우 message를 throw한다", async () => {
      vi.mocked(apiFetch).mockResolvedValue(
        Response.json(
          {
            code: "INVALID_PARAMETER",
            message: "이름 형식이 올바르지 않습니다.",
          },
          { status: 400 },
        ),
      );

      const request = updateUserNameApi("새이름");

      await expect(request).rejects.toThrow("이름 형식이 올바르지 않습니다.");
      await expect(request).rejects.toMatchObject({
        status: 400,
        code: "INVALID_PARAMETER",
      });
    });

    it("400 Bad Request 시 응답 바디가 비어있으면 기본 400 에러 메시지를 throw한다", async () => {
      vi.mocked(apiFetch).mockResolvedValue(
        new Response("Bad Request", { status: 400 }),
      );

      await expect(updateUserNameApi("새이름")).rejects.toThrow(
        "올바른 이름을 입력해주세요.",
      );
    });

    it("401 Unauthorized 시 서버 에러 메시지를 포함하여 throw한다", async () => {
      vi.mocked(apiFetch).mockResolvedValue(
        Response.json(
          {
            code: "UNAUTHORIZED",
            message: "인증 토큰이 유효하지 않습니다.",
          },
          { status: 401 },
        ),
      );

      const request = updateUserNameApi("새이름");

      await expect(request).rejects.toThrow("인증 토큰이 유효하지 않습니다.");
      await expect(request).rejects.toMatchObject({
        status: 401,
        code: "UNAUTHORIZED",
      });
    });

    it("404 Not Found 시 서버 에러 메시지를 포함하여 throw한다", async () => {
      vi.mocked(apiFetch).mockResolvedValue(
        Response.json(
          {
            code: "USER_NOT_FOUND",
            message: "사용자를 찾을 수 없습니다.",
          },
          { status: 404 },
        ),
      );

      const request = updateUserNameApi("새이름");

      await expect(request).rejects.toThrow("사용자를 찾을 수 없습니다.");
      await expect(request).rejects.toMatchObject({
        status: 404,
        code: "USER_NOT_FOUND",
      });
    });

    it("500 등 기타 서버 에러 시 기본 에러 메시지를 throw한다", async () => {
      vi.mocked(apiFetch).mockResolvedValue(
        new Response("Server Error", { status: 500 }),
      );

      await expect(updateUserNameApi("새이름")).rejects.toThrow(
        "이름 변경에 실패했습니다.",
      );
    });
  });
});
