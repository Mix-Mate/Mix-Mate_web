import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateGroup } from "./group.api";

const fetchMock = vi.fn<typeof fetch>();

describe("group validation response", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("그룹 수정 400 응답의 필드 오류를 보존한다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(
        {
          message: "입력값이 올바르지 않습니다.",
          errors: {
            groupName: "그룹 이름은 30자를 넘을 수 없습니다.",
          },
        },
        { status: 400 },
      ),
    );

    await expect(
      updateGroup("10", { groupName: "모임", description: "" }),
    ).rejects.toMatchObject({
      status: 400,
      fieldErrors: {
        groupName: "그룹 이름은 30자를 넘을 수 없습니다.",
      },
    });
  });
});
