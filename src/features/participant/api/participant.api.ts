import type {
  Participant,
  ParticipantGroup,
  ParticipantListResponse,
  ParticipantProfile,
  ParticipantProfileResponse,
  ParticipantSummaryResponse,
} from "../types/participant.types";
import { getGroupDetail } from "@/features/group/api/group.api";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";

const gradeLabels: Record<ParticipantProfileResponse["grade"], string> = {
  FIRST: "1학년",
  SECOND: "2학년",
  THIRD: "3학년",
  FOURTH: "4학년",
};

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

async function createRequestError(response: Response, fallbackMessage: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return new Error(body.message ?? fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}

export function toParticipantProfile(
  profile: ParticipantProfileResponse,
  participantId: string,
  visibility: Participant["visibility"] = "public",
): ParticipantProfile {
  return {
    id: participantId,
    name: profile.displayName,
    department: profile.major,
    visibility,
    role: profile.position === "STAFF" ? "staff" : "general",
    gender: profile.gender === "FEMALE" ? "female" : "male",
    grade: gradeLabels[profile.grade],
    mbti: profile.mbti,
    age: profile.age,
    instagramId: profile.instaId,
    bio: profile.bio,
    isNew: profile.isNew,
  };
}

async function request(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: withAuthHeaders({
      Accept: "application/json",
      ...init?.headers,
    }),
  });
}

export async function getParticipants(
  groupId: string,
): Promise<ParticipantGroup> {
  const [groupDetail, participantsResponse] = await Promise.all([
    getGroupDetail(groupId),
    request(`/api/v1/groups/${groupId}/participants`),
  ]);

  if (!participantsResponse.ok) {
    throw await createRequestError(
      participantsResponse,
      "참가자 목록을 불러오지 못했습니다.",
    );
  }

  const data = (await participantsResponse.json()) as ParticipantListResponse;

  return {
    groupName: groupDetail.groupName,
    participants: data.participantList.map(toParticipant),
    teams: [],
  };
}

export async function getParticipantProfile(
  groupId: string,
  participantId: string,
) {
  const response = await request(
    `/api/v1/groups/${groupId}/participants/${participantId}`,
  );

  if (!response.ok) {
    throw await createRequestError(
      response,
      "참가자 프로필을 불러오지 못했습니다.",
    );
  }

  const data = (await response.json()) as ParticipantProfileResponse;
  return toParticipantProfile(data, participantId);
}
