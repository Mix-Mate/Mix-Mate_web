import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import type { SecondRoundVoteStatusResponse } from "../types/secondRoundVoteStatus.types";
import { createVoteApiError } from "./voteApiError";

export async function getSecondRoundVoteStatus(
  groupId: string,
  signal?: AbortSignal,
): Promise<SecondRoundVoteStatusResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/votes/second-round/status`,
    {
      method: "GET",
      credentials: "include",
      headers: withAuthHeaders(),
      signal,
    },
  );

  if (!response.ok) {
    throw await createVoteApiError(
      response,
      "투표 현황을 불러오지 못했습니다.",
    );
  }

  return (await response.json()) as SecondRoundVoteStatusResponse;
}
