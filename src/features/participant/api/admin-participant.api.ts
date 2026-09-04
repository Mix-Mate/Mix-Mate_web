import type {
  AdminParticipant,
  AdminParticipantGroup,
  ParticipantListResponse,
  ParticipantProfileRequest,
  ParticipantSummaryResponse,
} from "../types/participant.types";
import { toBackendRound } from "@/features/assignment/model/assignment.mapper";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import { getGroupDetail } from "@/features/group/api/group.api";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import {
  getProfileGradeLabel,
  normalizeProfileMbti,
} from "@/shared/lib/profile-labels";
import {
  findAdminParticipantDraft,
  rememberAdminParticipantDraft,
} from "../model/admin-participant-draft-storage";
import { hydrateParticipantsWithProfiles } from "./participant.api";

function toVisibility(visibility: ParticipantSummaryResponse["visibility"]) {
  return visibility === "PRIVATE" ? "private" : "public";
}

function toGender(gender: ParticipantSummaryResponse["gender"]) {
  return gender === "FEMALE" ? "female" : "male";
}

function toRole(position?: ParticipantProfileRequest["position"]) {
  return position === "STAFF" ? "staff" : "general";
}


function toDefaultAdminParticipant(
  groupId: string,
  summary: ParticipantSummaryResponse,
): AdminParticipant {
  const draft = findAdminParticipantDraft(groupId, summary);
  const grade = summary.grade ?? draft?.grade;
  const position = summary.position ?? draft?.position;
  const isNew = summary.isNew ?? draft?.isNew ?? false;
  const mbti = normalizeProfileMbti(summary.mbti ?? draft?.mbti) ?? "";
  const age = summary.age ?? draft?.age ?? undefined;
  const instagramId = summary.instaId ?? draft?.instaId ?? undefined;
  const bio = summary.bio ?? draft?.bio ?? undefined;

  return {
    id: String(summary.participantId),
    name: summary.displayName,
    department: summary.major,
    visibility: toVisibility(summary.visibility),
    role: toRole(position),
    gender: toGender(summary.gender),
    grade: getProfileGradeLabel(grade) ?? "",
    isNew,
    mbti,
    age: age ?? undefined,
    instagramId: instagramId ?? undefined,
    bio: bio ?? undefined,
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

export async function getAdminParticipants(
  groupId: string,
  round: AssignmentRound,
  signal?: AbortSignal,
): Promise<AdminParticipantGroup> {
  const searchParams = new URLSearchParams({
    round: toBackendRound(round),
    role: "admin",
  });
  const [groupDetail, response] = await Promise.all([
    getGroupDetail(groupId),
    request(`/api/v1/groups/${groupId}/participants?${searchParams}`, {
      signal,
    }),
  ]);

  if (!response.ok) {
    throw await createRequestError(
      response,
      "참가자 목록을 불러오지 못했습니다.",
    );
  }

  const data = (await response.json()) as ParticipantListResponse;
  const participants = await hydrateParticipantsWithProfiles(
    groupId,
    data.participantList.map((summary) =>
      toDefaultAdminParticipant(groupId, summary),
    ),
    data.participantList,
    signal,
    { detailRole: "admin", hydrateAll: true },
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
    throw await createRequestError(response, "참가자 추가에 실패했습니다.");
  }

  rememberAdminParticipantDraft(groupId, input);

  return { ok: true as const, source: "api" as const };
}

export async function deleteParticipant(groupId: string, participantId: string) {
  const response = await request(
    `/api/v1/groups/${groupId}/participants/${participantId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw await createRequestError(response, "참가자 삭제에 실패했습니다.");
  }

  return { ok: true as const, source: "api" as const };
}
