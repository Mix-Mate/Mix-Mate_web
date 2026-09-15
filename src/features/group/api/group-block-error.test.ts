import { describe, expect, it } from "vitest";
import { GroupApiError, isExplicitGroupBlockError } from "./group.api";

describe("isExplicitGroupBlockError", () => {
  it.each(["USER_BLOCKED", "BANNED_USER", "BLOCKED"])(
    "%s 코드는 실제 차단으로 판정한다",
    (code) => {
      expect(
        isExplicitGroupBlockError(
          new GroupApiError("그룹에 참여할 수 없습니다.", 403, code),
        ),
      ).toBe(true);
    },
  );

  it.each([
    new GroupApiError("접근 권한이 없습니다.", 403, "FORBIDDEN"),
    new GroupApiError(
      "이 그룹에 참여하고 있지 않거나 차단되었습니다.",
      403,
      "FORBIDDEN",
    ),
    new GroupApiError("이 그룹에 참여하고 있지 않습니다.", 403),
    new GroupApiError("차단 여부를 확인하지 못했습니다.", 403),
  ])("일반 403/FORBIDDEN 오류는 차단으로 판정하지 않는다", (error) => {
    expect(isExplicitGroupBlockError(error)).toBe(false);
  });

  it.each([
    "관리자에 의해 해당 그룹에서 차단되었습니다.",
    "해당 그룹 관리자에 의해 참여가 차단된 사용자입니다.",
    "차단되어 입장할 수 없습니다.",
  ])("명시적인 차단 문구는 차단으로 판정한다", (message) => {
    expect(
      isExplicitGroupBlockError(
        new GroupApiError(message, 403, "FORBIDDEN"),
      ),
    ).toBe(true);
  });
});
