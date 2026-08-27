import type {
  AdminParticipant,
  AdminParticipantGroup,
  ParticipantListResponse,
  ParticipantProfileRequest,
  ParticipantProfileResponse,
  ParticipantSummaryResponse,
} from "../types/participant.types";
import { toParticipantProfile } from "./participant.api";
import { toBackendRound } from "@/features/assignment/model/assignment.mapper";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import { getGroupDetail } from "@/features/group/api/group.api";
import { createApiRequestError } from "@/shared/api/apiError";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";

function toVisibility(visibility: ParticipantSummaryResponse["visibility"]) {
  return visibility === "PUBLIC" ? "public" : "private";
}

function toGender(gender: ParticipantSummaryResponse["gender"]) {
  return gender === "FEMALE" ? "female" : "male";
}

function toDefaultAdminParticipant(
  summary: ParticipantSummaryResponse,
): AdminParticipant {
  return {
    id: String(summary.participantId),
    name: summary.displayName,
    department: summary.major,
    visibility: toVisibility(summary.visibility),
    role: "general",
    gender: toGender(summary.gender),
    grade: "",
    isNew: false,
    mbti: "",
    age: undefined,
    instagramId: undefined,
    bio: undefined,
  };
}

async function request(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: withAuthHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    }),
  });
}

async function getParticipantDetail(
  groupId: string,
  summary: ParticipantSummaryResponse,
): Promise<AdminParticipant> {
  const participantId = String(summary.participantId);
  const response = await request(
    `/api/v1/groups/${groupId}/participants/${participantId}`,
  );

  if (!response.ok) {
    return toDefaultAdminParticipant(summary);
  }

  const profile = (await response.json()) as ParticipantProfileResponse;
  return toParticipantProfile(profile, participantId, toVisibility(summary.visibility));
}

export async function getAdminParticipants(
  groupId: string,
  round: AssignmentRound,
): Promise<AdminParticipantGroup> {
  const [groupDetail, response] = await Promise.all([
    getGroupDetail(groupId),
    request(`/api/v1/groups/${groupId}/participants?round=${toBackendRound(round)}`),
  ]);

  if (!response.ok) {
    throw await createApiRequestError(response, "참가자 목록을 불러오지 못했습니다.");
  }

  const data = (await response.json()) as ParticipantListResponse;
  const participants = await Promise.all(
    data.participantList.map((summary) => getParticipantDetail(groupId, summary)),
  );

  return {
    groupName: groupDetail.groupName,
    participants,
  };
}

export async function addParticipant(
  groupId: string,
  input: ParticipantProfileRequest,
) {
  const response = await request(`/api/v1/groups/${groupId}/participants`, {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await createApiRequestError(response, "참가자 추가에 실패했습니다.");
  }

  return { ok: true as const, source: "api" as const };
}

export async function deleteParticipant(groupId: string, participantId: string) {
  const response = await request(
    `/api/v1/groups/${groupId}/participants/${participantId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw await createApiRequestError(response, "참가자 삭제에 실패했습니다.");
  }

  return { ok: true as const, source: "api" as const };
}
