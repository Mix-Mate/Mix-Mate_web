import { getGroupDetail } from "@/features/group/api/group.api";
import { getSecondRoundVoteStatus } from "@/features/vote/api/secondRoundVoteStatus.api";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { getGroupEntryRoute } from "./group-entry-route";

export async function resolveGroupEntryRoute(
  groupId: string,
  role: string | null | undefined,
  status?: string,
): Promise<string> {
  const fallbackRoute = getGroupEntryRoute(groupId, role, status);

  if (status?.trim().toUpperCase() !== "VOTING") {
    return fallbackRoute;
  }

  try {
    const [group, voteStatus] = await Promise.all([
      getGroupDetail(groupId),
      getSecondRoundVoteStatus(groupId),
    ]);
    const myVote = voteStatus.participants.find(
      (participant) => participant.participantId === group.myParticipantId,
    );

    return myVote && myVote.choice !== null
      ? groupRoutes.voteStatus(groupId)
      : groupRoutes.mvpVote(groupId);
  } catch {
    return fallbackRoute;
  }
}
