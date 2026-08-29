import { groupRoutes } from "@/shared/lib/navigation/routes";

export function isGroupHost(role: string | null | undefined): boolean {
  return role?.trim().toUpperCase() === "HOST";
}

export function getGroupEntryRoute(
  groupId: string,
  role: string | null | undefined,
  status?: string,
): string {
  if (!isGroupHost(role)) {
    return groupRoutes.userHome(groupId);
  }

  if (status?.trim().toUpperCase() === "RECRUITING") {
    return groupRoutes.adminRecruitment(groupId);
  }

  return groupRoutes.adminHome(groupId);
}
