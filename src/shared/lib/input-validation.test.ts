import { describe, expect, it } from "vitest";
import {
  INPUT_VALIDATION_RULES,
  mapServerFieldErrors,
  validateInputField,
} from "./input-validation";

describe("input validation", () => {
  it("한글 완성형과 자모 및 필드별 허용 기호를 허용한다", () => {
    expect(
      validateInputField("groupName", "ㅋㅋ술모임 / A-1_#@:+&"),
    ).toBeNull();
    expect(
      validateInputField(
        "description",
        "ㅠㅠ\n설명 100% (A+B) * 2 = 4; '확인'",
      ),
    ).toBeNull();
    expect(validateInputField("displayName", "ㄱㄱ A.1_-")).toBeNull();
    expect(validateInputField("major", "컴퓨터공학과_1-A")).toBeNull();
    expect(
      validateInputField("bio", "안녕하세요\r\n취미: 음악/영화"),
    ).toBeNull();
    expect(validateInputField("instaId", "mix.mate_74")).toBeNull();
  });

  it("이모지와 필드별 허용되지 않은 문자를 거부한다", () => {
    expect(validateInputField("displayName", "다래😍")).toBe(
      INPUT_VALIDATION_RULES.displayName.characterMessage,
    );
    expect(validateInputField("groupName", "동아리🔥")).toBe(
      INPUT_VALIDATION_RULES.groupName.characterMessage,
    );
    expect(validateInputField("major", "컴퓨터공학과❤️")).toBe(
      INPUT_VALIDATION_RULES.major.characterMessage,
    );
    expect(validateInputField("instaId", "@mixmate")).toBe(
      INPUT_VALIDATION_RULES.instaId.characterMessage,
    );
  });

  it("각 필드의 최대 길이를 넘으면 길이 메시지를 우선 반환한다", () => {
    for (const field of Object.keys(INPUT_VALIDATION_RULES) as Array<
      keyof typeof INPUT_VALIDATION_RULES
    >) {
      const rule = INPUT_VALIDATION_RULES[field];
      expect(validateInputField(field, "가".repeat(rule.maxLength + 1))).toBe(
        rule.lengthMessage,
      );
    }
  });

  it("중첩 profile 서버 필드명을 입력 필드명으로 평탄화한다", () => {
    expect(
      mapServerFieldErrors({
        "profile.displayName": "서버 이름 오류",
        "profile.major": "서버 전공 오류",
      }),
    ).toEqual({
      displayName: "서버 이름 오류",
      major: "서버 전공 오류",
    });
  });
});
