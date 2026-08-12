import { getAssignmentResult } from "../api/assignment.api";
import type { AssignmentRound } from "../types/assignment.types";

export function useAssignmentResultQuery(
  groupId: string,
  round: AssignmentRound,
) {
  return {
    data: getAssignmentResult(groupId, round),
  };
}
