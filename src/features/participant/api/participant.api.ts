import { getAdminParticipantProfileMock } from "./admin-participant.mock";
import {
  getParticipantListMock,
  getParticipantProfileMock,
} from "./participant.mock";
import type {
  Participant,
  ParticipantGroup,
  ParticipantListResponse,
  ParticipantProfile,
  ParticipantProfileResponse,
  ParticipantSummaryResponse,
} from "../types/participant.types";
import { getGroupDetail } from "@/features/group/api/group.api";
import {
  createApiRequestError,
  shouldUseMockFallback,
} from "@/shared/api/apiError";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";

function toVisibility(visibility: ParticipantSummaryResponse["visibility"]) {
  return visibility === "PUBLIC" ? "public" : "private";
}

function toGender(gender: ParticipantSummaryResponse["gender"]) {
  return gender === "FEMALE" ? "female" : "male";
}

function toParticipant(summary: ParticipantSummaryResponse): Participant {
  return {
    id: String(summary.participantId),
    name: summary.displayName,
    department: summary.major,
    visibility: toVisibility(summary.visibility),
    role: "general",
    gender: toGender(summary.gender),
  };
}

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

export async function getParticipants(
  groupId: string,
): Promise<ParticipantGroup> {
  try {
    const [groupDetail, participantsResponse] = await Promise.all([
      getGroupDetail(groupId),
      fetch(`${API_BASE_URL}/api/v1/groups/${groupId}/participants`, {
        credentials: "include",
        headers: withAuthHeaders({
          Accept: "application/json",
        }),
      }),
    ]);

    if (!participantsResponse.ok) {
      throw await createApiRequestError(
        participantsResponse,
        "참가자 목록 API 요청 실패",
      );
    }

    const data = (await participantsResponse.json()) as ParticipantListResponse;

    return {
      groupName: groupDetail.groupName,
      participants: data.participantList.map(toParticipant),
      teams: [],
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    return getParticipantListMock();
  }
}

export async function getParticipantProfile(
  groupId: string,
  participantId: string,
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/groups/${groupId}/participants/${participantId}`,
      {
        credentials: "include",
        headers: withAuthHeaders({
          Accept: "application/json",
        }),
      },
    );

    if (!response.ok) {
      throw await createApiRequestError(
        response,
        "참가자 프로필 API 요청 실패",
      );
    }

    const data = (await response.json()) as ParticipantProfileResponse;
    return toProfile(data, participantId);
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    return (
      getAdminParticipantProfileMock(participantId) ??
      getParticipantProfileMock(participantId)
    );
  }
}
