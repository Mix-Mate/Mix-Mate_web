import type { AssignmentWarning } from "../types/assignment.types";

export function assertValidGroupCount(
  groupCount: number,
  participantCount: number,
) {
  if (groupCount < 2) {
    throw new Error("조는 최소 2개 이상이어야 합니다.");
  }
  if (groupCount > participantCount) {
    throw new Error("조 개수가 참가자 수보다 많을 수 없습니다.");
  }
}

export function getAssignmentWarnings(
  groupCount: number,
  participantCount: number,
): AssignmentWarning[] {
  const warnings: AssignmentWarning[] = [];

  if (participantCount % groupCount !== 0) {
    warnings.push({
      code: "UNEVEN_GROUP_SIZE",
      message: "조별 인원을 완전히 동일하게 나눌 수 없어요.",
    });
  }

  return warnings;
}
