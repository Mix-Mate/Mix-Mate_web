import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import { createVoteApiError } from "./voteApiError";

export async function finishVote(groupId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/votes/finish`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw await createVoteApiError(response, "투표 종료에 실패했습니다.");
  }
}
