import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
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
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/participants?round=${toBackendRound(round)}`,
    {},
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
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/${toBackendRound(round)}/teams/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/${toBackendRound(round)}/teams`,
    {},
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "조 편성 결과를 불러오지 못했습니다."),
    );
  }

  const data = (await response.json()) as { teams: AssignmentTeam[] };
  return data.teams;
}

/**
 * 그룹이 실제로 2차까지 진행됐는지 확인한다.
 * (group.status는 FINISHED가 되면 몇 차까지 진행됐는지 정보를 잃으므로,
 * 2차 조 편성 데이터 존재 여부로 역으로 판단한다.)
 * 관리자는 항상 정확하게 판단 가능하고, 2차 미참여 참가자는 403이 나서
 * 판단할 수 없으므로 그 경우 null을 반환해 호출부가 기본값을 쓰게 한다.
 */
export async function hasSecondRoundTeams(
  groupId: string,
  signal?: AbortSignal,
): Promise<boolean | null> {
  try {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/SECOND_ROUND/teams`,
      { signal },
    );

    if (response.ok) return true;
    if (response.status === 409) return false;
    return null;
  } catch {
    return null;
  }
}

export async function confirmTeams(
  groupId: string,
  round: AssignmentRound,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/${toBackendRound(round)}/teams/confirm`,
    {
      method: "POST",
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
