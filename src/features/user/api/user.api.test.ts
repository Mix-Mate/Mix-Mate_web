import { describe, expect, it } from "vitest";
import { updateUserNameApi, validateUserName } from "./user.api";

describe("user.api", () => {
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

  describe("updateUserNameApi (Mock)", () => {
    it("유효한 이름을 전달하면 500ms 후 trimmed된 userName을 반환한다", async () => {
      const response = await updateUserNameApi("  새이름  ");
      expect(response).toEqual({
        userName: "새이름",
        message: "이름이 성공적으로 변경되었습니다.",
      });
    });

    it("유효하지 않은 이름을 전달하면 Error를 throw한다", async () => {
      await expect(updateUserNameApi(" ")).rejects.toThrow(
        "이름을 입력해주세요.",
      );
      await expect(updateUserNameApi("가")).rejects.toThrow(
        "이름은 2자 이상 10자 이하로 입력해주세요.",
      );
    });
  });
});
