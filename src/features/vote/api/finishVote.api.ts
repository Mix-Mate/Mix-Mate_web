import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { createVoteApiError } from "./voteApiError";

export async function finishVote(groupId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/votes/finish`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw await createVoteApiError(response, "투표 종료에 실패했습니다.");
  }
}
