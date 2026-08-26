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
import { toBackendRound } from "@/features/assignment/model/assignment.mapper";
import type { AssignmentRound } from "@/features/assignment/types/assignment.types";
import {
  createApiRequestError,
  shouldUseMockFallback,
} from "@/shared/api/apiError";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";

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
    ...init,
    headers: withAuthHeaders({
      "Content-Type": "application/json",
      ...init?.headers,
    }),
  });
}

export async function getAdminParticipants(
  groupId: string,
  round: AssignmentRound,
): Promise<AdminParticipantGroup> {
  const fallbackGroup = getAdminParticipantListMock();

  try {
    const response = await request(
      `/api/v1/groups/${groupId}/participants?round=${toBackendRound(round)}`,
    );

    if (!response.ok) {
      throw await createApiRequestError(
        response,
        "참가자 목록 API 요청 실패",
      );
    }

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
      participants,
    };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

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

    if (!response.ok) {
      throw await createApiRequestError(
        response,
        "참가자 추가 API 요청 실패",
      );
    }

    return { ok: true as const, source: "api" as const };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    addAdminParticipantMock(input);
    return { ok: true as const, source: "mock" as const };
  }
}

export async function deleteParticipant(groupId: string, participantId: string) {
  try {
    const response = await request(
      `/api/v1/groups/${groupId}/participants/${participantId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      throw await createApiRequestError(
        response,
        "참가자 삭제 API 요청 실패",
      );
    }

    return { ok: true as const, source: "api" as const };
  } catch (error) {
    if (!shouldUseMockFallback(error)) {
      throw error;
    }

    deleteAdminParticipantMock(participantId);
    return { ok: true as const, source: "mock" as const };
  }
}
