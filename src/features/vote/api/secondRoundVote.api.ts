import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import type { SecondRoundVoteChoice } from "../types/secondRoundVote.types";
import { createVoteApiError } from "./voteApiError";

export async function voteSecondRound(
  groupId: string,
  choice: SecondRoundVoteChoice,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/votes/second-round`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ choice }),
    },
  );

  if (!response.ok) {
    throw await createVoteApiError(
      response,
      "2차 참여 여부 투표에 실패했습니다.",
    );
  }
}
