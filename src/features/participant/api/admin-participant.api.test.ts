import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addParticipant } from "./admin-participant.api";
import type { ParticipantProfileRequest } from "../types/participant.types";

const fetchMock = vi.fn<typeof fetch>();

const participant: ParticipantProfileRequest = {
  displayName: "다래",
  position: "MEMBER",
  major: "컴퓨터공학과",
  isNew: true,
  grade: "FIRST",
  gender: "FEMALE",
  mbti: "ENFP",
  age: null,
  instaId: null,
  bio: null,
  visibility: "PUBLIC",
};

describe("admin participant api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("수동 참가자 등록 400 응답의 필드 오류를 보존한다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(
        {
          message: "입력값이 올바르지 않습니다.",
          errors: {
            displayName: "보여질 이름은 10자를 넘을 수 없습니다.",
          },
        },
        { status: 400 },
      ),
    );

    await expect(addParticipant("10", participant)).rejects.toMatchObject({
      status: 400,
      fieldErrors: {
        displayName: "보여질 이름은 10자를 넘을 수 없습니다.",
      },
    });
  });
});
