import type { GroupDetail } from "@/features/group/types/group.types";
import { getGroupEntryRoute } from "@/features/group/lib/group-entry-route";
import { groupRoutes } from "@/shared/lib/navigation/routes";

export function getVotePageRedirect(
  groupId: string,
  group: GroupDetail | null,
  isComplete: boolean,
  hasAttendanceVote: boolean,
): string | null {
  if (!group) return null;

  if (
    group.status === "RECRUITING" ||
    group.status === "BEFORE_FIRST_ROUND" ||
    group.status === "FIRST_ROUND"
  ) {
    return getGroupEntryRoute(groupId, group.myRole, group.status);
  }

  if (group.status !== "VOTING" || isComplete) {
    return groupRoutes.voteResult(groupId);
  }

  if (hasAttendanceVote) {
    return group.myRole === "HOST"
      ? groupRoutes.adminVoteStatus(groupId)
      : groupRoutes.voteStatus(groupId);
  }

  return null;
}
