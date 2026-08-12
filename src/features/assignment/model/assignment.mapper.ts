import type { AssignmentMember, AssignmentTeam } from "../types/assignment.types";

export function toAssignmentTeams(
  members: AssignmentMember[],
  groupCount: number,
): AssignmentTeam[] {
  return Array.from({ length: groupCount }, (_, index) => ({
    teamId: `team-${index + 1}`,
    teamNumber: index + 1,
    members: members.filter((_, memberIndex) => memberIndex % groupCount === index),
  }));
}
