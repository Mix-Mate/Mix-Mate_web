import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import { toBackendRound } from "../model/assignment.mapper";
import type {
  AssignmentProgressStatus,
  AssignmentRound,
  AssignmentTeam,
  ParticipantCandidate,
  TeamGenerateRequestBody,
  TeamGenerateResponse,
} from "../types/assignment.types";

const PROCESSING_DURATION_MS = 3000;

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getParticipants(
  groupId: string,
  round: AssignmentRound,
): Promise<ParticipantCandidate[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/participants?round=${toBackendRound(round)}`,
    { credentials: "include", headers: withAuthHeaders() },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "참가자 목록을 불러오지 못했습니다."),
    );
  }

  const data = (await response.json()) as {
    participantList: ParticipantCandidate[];
  };

  return data.participantList;
}

export async function generateTeams(
  groupId: string,
  round: AssignmentRound,
  body: TeamGenerateRequestBody,
): Promise<TeamGenerateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/${toBackendRound(round)}/teams/generate`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "조 편성 실행에 실패했습니다."),
    );
  }

  return (await response.json()) as TeamGenerateResponse;
}

export async function getTeams(
  groupId: string,
  round: AssignmentRound,
): Promise<AssignmentTeam[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/${toBackendRound(round)}/teams`,
    { credentials: "include", headers: withAuthHeaders() },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "조 편성 결과를 불러오지 못했습니다."),
    );
  }

  const data = (await response.json()) as { teams: AssignmentTeam[] };
  return data.teams;
}

export async function confirmTeams(
  groupId: string,
  round: AssignmentRound,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/${toBackendRound(round)}/teams/confirm`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "조 편성 확정에 실패했습니다."),
    );
  }
}

export function getAssignmentStatus(
  startedAt: number,
): AssignmentProgressStatus {
  const elapsedMs = Date.now() - startedAt;
  const progress = Math.min(
    100,
    Math.round((elapsedMs / PROCESSING_DURATION_MS) * 100),
  );

  return { progress, isComplete: progress >= 100 };
}
