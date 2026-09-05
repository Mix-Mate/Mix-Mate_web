import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMyGroupProfile,
  updateParticipantProfile,
} from "./profile.api";
import type { ParticipantProfileRequest } from "../types/profile.types";

const fetchMock = vi.fn<typeof fetch>();

const fullProfile: ParticipantProfileRequest = {
  displayName: "수정한이름",
  position: "STAFF",
  major: "컴퓨터공학과",
  isNew: false,
  grade: "THIRD",
  gender: "MALE",
  mbti: "ENFP",
  age: 24,
  instaId: "mixmate_user",
  bio: "반갑습니다",
  visibility: "PRIVATE",
};

describe("profile api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("프로필 수정 성공 시 제출한 전체 프로필을 보존한다", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await updateParticipantProfile("10", fullProfile);

    fetchMock.mockResolvedValueOnce(
      Response.json({
        participantId: 23,
        displayName: "수정한이름",
      }),
    );

    await expect(getMyGroupProfile("10")).resolves.toMatchObject({
      id: "23",
      displayName: "수정한이름",
      position: "STAFF",
      major: "컴퓨터공학과",
      isNew: false,
      grade: "THIRD",
      gender: "MALE",
      mbti: "ENFP",
      age: 24,
      instaId: "mixmate_user",
      bio: "반갑습니다",
      visibility: "PRIVATE",
    });
  });

  it("서버의 대체 필드명을 내 프로필 필드로 정규화한다", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        id: 7,
        name: "대체이름",
        department: "산업공학과",
        instagramId: "alt_user",
      }),
    );

    await expect(getMyGroupProfile("10")).resolves.toMatchObject({
      id: "7",
      displayName: "대체이름",
      major: "산업공학과",
      instaId: "alt_user",
    });
  });
});
