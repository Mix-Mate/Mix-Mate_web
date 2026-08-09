import type {
  EndRoundResult,
  GroupRound,
} from "../types/session.types";

export async function endGroupRound(
  groupId: string,
  round: GroupRound,
): Promise<EndRoundResult> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  return {
    groupId,
    endedRound: round,
    nextStatus: round === 1 ? "VOTING" : "FINISHED",
  };
}
