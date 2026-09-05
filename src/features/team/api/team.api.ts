import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import type { MyTeamResponse, TeamRound } from "../types/team.types";

const MY_TEAM_ERROR_MESSAGE = "내 조 정보를 불러오지 못했습니다.";

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === "string"
      ? body.message
      : MY_TEAM_ERROR_MESSAGE;
  } catch {
    return MY_TEAM_ERROR_MESSAGE;
  }
}

export async function getMyTeam(
  groupId: number | string,
  round: TeamRound,
  signal?: AbortSignal,
): Promise<MyTeamResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/${round}/teams/my-team`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as MyTeamResponse;
}
