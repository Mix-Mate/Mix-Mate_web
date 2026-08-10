import type { EndRoundResult, GroupRound } from "../types/session.types";
import { mockDelay } from "@/shared/api/mockDelay";

export async function endGroupRound(
  groupId: string,
  round: GroupRound,
): Promise<EndRoundResult> {
  await mockDelay();

  return {
    groupId,
    endedRound: round,
    nextStatus: round === 1 ? "VOTING" : "FINISHED",
  };
}
