import { getCurrentGroupRound } from "@/features/group/model/group-status";
import type { GroupStatus } from "@/features/group/types/group.types";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";

export function resolveAssignmentRound(
  routeRound: string | undefined,
  groupStatus: GroupStatus | undefined,
) {
  return routeRound
    ? toAssignmentRound(routeRound)
    : groupStatus
      ? getCurrentGroupRound(groupStatus)
      : 1;
}
