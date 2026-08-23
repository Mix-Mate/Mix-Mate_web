import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import type { VoteResultResponse } from "../types/voteResult.types";
import { createVoteApiError } from "./voteApiError";

export async function getVoteResult(
  groupId: string,
): Promise<VoteResultResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/votes/result`,
    {
      method: "GET",
      credentials: "include",
      headers: withAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw await createVoteApiError(
      response,
      "투표 결과를 불러오지 못했습니다.",
    );
  }

  return (await response.json()) as VoteResultResponse;
}
