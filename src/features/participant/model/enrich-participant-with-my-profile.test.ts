import { describe, expect, it } from "vitest";
import { enrichParticipantWithMyProfile } from "./enrich-participant-with-my-profile";
import type { Participant } from "../types/participant.types";
import type { MyGroupProfile } from "@/features/profile/types/profile.types";

describe("enrichParticipantWithMyProfile", () => {
  it("내 프로필 응답에 일부 값이 비어도 기존 참가자 정보를 지우지 않는다", () => {
    const participant: Participant = {
      id: "23",
      name: "기존이름",
      department: "컴퓨터공학과",
      visibility: "public",
      role: "staff",
      gender: "male",
      grade: "3학년",
      isNew: true,
      mbti: "ENFP",
      age: 24,
      instagramId: "old_user",
      bio: "기존 소개",
    };
    const partialProfile = {
      id: "23",
      displayName: "새이름",
    } as MyGroupProfile;

    expect(
      enrichParticipantWithMyProfile(participant, partialProfile, "23"),
    ).toMatchObject({
      name: "새이름",
      department: "컴퓨터공학과",
      visibility: "public",
      role: "staff",
      gender: "male",
      grade: "3학년",
      isNew: true,
      mbti: "ENFP",
      age: 24,
      instagramId: "old_user",
      bio: "기존 소개",
    });
  });
});
