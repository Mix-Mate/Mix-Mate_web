import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
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
): Promise<MyTeamResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/rounds/${round}/teams/my-team`,
    {
      method: "GET",
      credentials: "include",
      headers: withAuthHeaders({ Accept: "application/json" }),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as MyTeamResponse;
}
