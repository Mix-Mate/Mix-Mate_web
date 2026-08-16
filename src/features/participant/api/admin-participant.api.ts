import {
  addAdminParticipantMock,
  deleteAdminParticipantMock,
  getAdminParticipantListMock,
} from "./admin-participant.mock";
import type {
  AdminParticipant,
  AdminParticipantGroup,
  ParticipantListResponse,
  ParticipantProfileRequest,
  ParticipantSummaryResponse,
} from "../types/participant.types";

const API_BASE_URL = "https://mixmate.duckdns.org";

function toVisibility(visibility: ParticipantSummaryResponse["visibility"]) {
  return visibility === "PUBLIC" ? "public" : "private";
}

function mapParticipantSummary(
  summary: ParticipantSummaryResponse,
  fallback?: AdminParticipant,
): AdminParticipant {
  return {
    id: String(summary.participantId),
    name: summary.displayName,
    department: summary.major,
    visibility: toVisibility(summary.visibility),
    role: fallback?.role ?? "general",
    gender: fallback?.gender ?? "male",
    grade: fallback?.grade ?? "1학년",
    isNew: fallback?.isNew ?? true,
    mbti: fallback?.mbti ?? "ISTP",
    age: fallback?.age,
    instagramId: fallback?.instagramId,
    bio: fallback?.bio,
  };
}

async function request(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });
}

export async function getAdminParticipants(
  groupId: string,
): Promise<AdminParticipantGroup> {
  const fallbackGroup = getAdminParticipantListMock();

  try {
    const response = await request(`/api/v1/groups/${groupId}/participants`);

    if (!response.ok) throw new Error("참가자 목록 API 요청 실패");

    const data = (await response.json()) as ParticipantListResponse;
    const participants = data.participantList.map((summary) =>
      mapParticipantSummary(
        summary,
        fallbackGroup.participants.find(
          (participant) => participant.id === String(summary.participantId),
        ),
      ),
    );

    return {
      ...fallbackGroup,
      participants: participants.length > 0 ? participants : fallbackGroup.participants,
    };
  } catch {
    return fallbackGroup;
  }
}

export async function addParticipant(
  groupId: string,
  input: ParticipantProfileRequest,
) {
  try {
    const response = await request(`/api/v1/groups/${groupId}/participants`, {
      method: "POST",
      body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error("참가자 추가 API 요청 실패");

    return { ok: true, source: "api" as const };
  } catch {
    addAdminParticipantMock(input);
    return { ok: true, source: "mock" as const };
  }
}

export async function deleteParticipant(groupId: string, participantId: string) {
  try {
    const response = await request(
      `/api/v1/groups/${groupId}/participants/${participantId}`,
      { method: "DELETE" },
    );

    if (!response.ok) throw new Error("참가자 삭제 API 요청 실패");

    return { ok: true, source: "api" as const };
  } catch {
    deleteAdminParticipantMock(participantId);
    return { ok: true, source: "mock" as const };
  }
}
