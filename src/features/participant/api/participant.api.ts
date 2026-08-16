import { getAdminParticipantProfileMock } from "./admin-participant.mock";
import { getParticipantProfileMock } from "./participant.mock";
import type {
  ParticipantProfile,
  ParticipantProfileResponse,
} from "../types/participant.types";

const API_BASE_URL = "https://mixmate.duckdns.org";

function toProfile(
  profile: ParticipantProfileResponse,
  participantId: string,
): ParticipantProfile {
  return {
    id: participantId,
    name: profile.displayName,
    department: profile.major,
    visibility: "public",
    role: profile.position === "STAFF" ? "staff" : "general",
    gender: profile.gender === "FEMALE" ? "female" : "male",
    grade: {
      FIRST: "1학년",
      SECOND: "2학년",
      THIRD: "3학년",
      FOURTH: "4학년",
    }[profile.grade],
    mbti: profile.mbti,
    age: profile.age,
    instagramId: profile.instaId,
    bio: profile.bio,
    isNew: profile.isNew,
  };
}

export async function getParticipantProfile(
  groupId: string,
  participantId: string,
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/groups/${groupId}/participants/${participantId}`,
      { credentials: "include" },
    );

    if (!response.ok) throw new Error("참가자 프로필 API 요청 실패");

    const data = (await response.json()) as ParticipantProfileResponse;
    return toProfile(data, participantId);
  } catch {
    return (
      getAdminParticipantProfileMock(participantId) ??
      getParticipantProfileMock(participantId)
    );
  }
}
