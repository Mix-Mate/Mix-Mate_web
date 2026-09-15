import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateGroup, verifyInviteCodeApi } from "./group.api";

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

  it("참여코드 검증 409 응답 시 INVALID_GROUP_STATUS 코드와 '참가자 모집이 마감된 그룹입니다.' 메시지를 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(
        {
          code: "INVALID_GROUP_STATUS",
          message: "참가자 모집이 마감된 그룹입니다.",
        },
        { status: 409 },
      ),
    );

    await expect(
      verifyInviteCodeApi({ inviteCode: "ABCDEF" }),
    ).rejects.toMatchObject({
      status: 409,
      code: "INVALID_GROUP_STATUS",
      message: "참가자 모집이 마감된 그룹입니다.",
    });
  });

  it("참여코드 검증 404 응답 시 INVALID_INVITE_CODE 코드와 '유효하지 않은 초대코드입니다.' 메시지를 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(
        {
          code: "INVALID_INVITE_CODE",
          message: "유효하지 않은 초대코드입니다.",
        },
        { status: 404 },
      ),
    );

    await expect(
      verifyInviteCodeApi({ inviteCode: "INV123" }),
    ).rejects.toMatchObject({
      status: 404,
      code: "INVALID_INVITE_CODE",
      message: "유효하지 않은 초대코드입니다.",
    });
  });
});
