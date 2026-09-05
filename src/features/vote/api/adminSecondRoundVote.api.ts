import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import type { SecondRoundVoteChoice } from "../types/secondRoundVote.types";
import { createVoteApiError } from "./voteApiError";

async function sendAdminVoteRequest(
  method: "POST" | "PATCH",
  groupId: string,
  targetParticipantId: number,
  choice: SecondRoundVoteChoice,
  fallbackMessage: string,
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/votes/second-round/admin`,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetParticipantId, choice }),
    },
  );

  if (!response.ok) {
    throw await createVoteApiError(response, fallbackMessage);
  }
}

export async function voteSecondRoundByHost(
  groupId: string,
  targetParticipantId: number,
  choice: SecondRoundVoteChoice,
): Promise<void> {
  await sendAdminVoteRequest(
    "POST",
    groupId,
    targetParticipantId,
    choice,
    "대신 투표하기에 실패했습니다.",
  );
}

export async function correctSecondRoundVoteByHost(
  groupId: string,
  targetParticipantId: number,
  choice: SecondRoundVoteChoice,
): Promise<void> {
  await sendAdminVoteRequest(
    "PATCH",
    groupId,
    targetParticipantId,
    choice,
    "투표 정정에 실패했습니다.",
  );
}
