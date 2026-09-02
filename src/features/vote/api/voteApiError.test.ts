import { describe, expect, it } from "vitest";
import { isAlreadyVotedError, VoteApiError } from "./voteApiError";

describe("투표 오류 분류", () => {
  it.each([400, 403, 409, 422])(
    "HTTP %s 자체를 투표 완료로 오인하지 않는다",
    (status) => {
      expect(
        isAlreadyVotedError(
          new VoteApiError(status, "FORBIDDEN", "투표 권한이 없습니다."),
        ),
      ).toBe(false);
    },
  );

  it.each(["ALREADY_VOTED", "VOTE_ALREADY_SUBMITTED", "ALREADY_COMPLETED"])(
    "명시적인 중복 투표 코드 %s를 처리한다",
    (code) => {
      expect(
        isAlreadyVotedError(new VoteApiError(400, code, "중복 투표")),
      ).toBe(true);
    },
  );

  it("투표 종료를 제출 완료로 오인하지 않는다", () => {
    expect(
      isAlreadyVotedError(
        new VoteApiError(409, "VOTE_CLOSED", "이미 투표가 종료되었습니다."),
      ),
    ).toBe(false);
    expect(isAlreadyVotedError(new Error("투표가 종료되었습니다."))).toBe(
      false,
    );
  });
});
