import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { createVoteApiError } from "./voteApiError";

export async function voteMvp(
  groupId: string,
  targetParticipantId: number,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/votes/mvp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetParticipantId }),
    },
  );

  if (!response.ok) {
    throw await createVoteApiError(response, "MVP 투표에 실패했습니다.");
  }
}
