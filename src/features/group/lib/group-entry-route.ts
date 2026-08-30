import { groupRoutes } from "@/shared/lib/navigation/routes";

export function isGroupHost(role: string | null | undefined): boolean {
  return role?.trim().toUpperCase() === "HOST";
}

export function getGroupEntryRoute(
  groupId: string,
  role: string | null | undefined,
  status?: string,
): string {
  const normalizedStatus = status?.trim().toUpperCase();

  if (!isGroupHost(role)) {
    if (normalizedStatus === "VOTING") {
      return groupRoutes.mvpVote(groupId);
    }
    return groupRoutes.userHome(groupId);
  }

  if (normalizedStatus === "RECRUITING") {
    return groupRoutes.adminRecruitment(groupId);
  }

  if (normalizedStatus === "VOTING") {
    return groupRoutes.adminVoteStatus(groupId);
  }

  return groupRoutes.adminHome(groupId);
}
