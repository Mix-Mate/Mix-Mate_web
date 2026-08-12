import { mockDelay } from "@/shared/api/mockDelay";
import { toAssignmentTeams } from "../model/assignment.mapper";
import {
  getAssignmentDraft,
  saveFixedMembersDraft,
} from "../model/assignmentDraft.store";
import type {
  AssignmentMember,
  AssignmentResult,
  AssignmentRound,
  AssignmentStatus,
  FixedMemberEntry,
} from "../types/assignment.types";

const participantMocks: AssignmentMember[] = [
  { memberId: "lee-seoyeon", memberName: "이서연", profileImage: null },
  { memberId: "park-doyun", memberName: "박도윤", profileImage: null },
  { memberId: "choi-jiwoo", memberName: "최지우", profileImage: null },
  { memberId: "jeong-seowoo", memberName: "정서우", profileImage: null },
  { memberId: "kang-hayoon", memberName: "강하윤", profileImage: null },
  { memberId: "jo-yejun", memberName: "조예준", profileImage: null },
  { memberId: "yoon-seohyun", memberName: "윤서현", profileImage: null },
  { memberId: "kim-minjun", memberName: "김민준", profileImage: null },
];

const assignmentStatuses = new Map<string, AssignmentStatus>();
const assignmentResults = new Map<string, AssignmentResult>();

function getStatusKey(groupId: string, round: AssignmentRound) {
  return `${groupId}:${round}`;
}

export function getParticipantPool(): AssignmentMember[] {
  return participantMocks;
}

export function getAssignmentStatus(
  groupId: string,
  round: AssignmentRound,
): AssignmentStatus {
  return assignmentStatuses.get(getStatusKey(groupId, round)) ?? "DRAFT";
}

export function getAssignmentResult(
  groupId: string,
  round: AssignmentRound,
): AssignmentResult | null {
  return assignmentResults.get(getStatusKey(groupId, round)) ?? null;
}

export async function createAssignment(
  groupId: string,
  round: AssignmentRound,
) {
  const draft = getAssignmentDraft(groupId, round);
  if (!draft.setup) {
    throw new Error("먼저 조 편성 설정을 완료해주세요.");
  }

  assignmentStatuses.set(getStatusKey(groupId, round), "PROCESSING");
  await mockDelay(800);

  const result: AssignmentResult = {
    round,
    status: "COMPLETED",
    teams: toAssignmentTeams(participantMocks, draft.setup.groupCount),
  };

  assignmentResults.set(getStatusKey(groupId, round), result);
  assignmentStatuses.set(getStatusKey(groupId, round), "COMPLETED");

  return result;
}

export async function regenerateAssignment(
  groupId: string,
  round: AssignmentRound,
) {
  return createAssignment(groupId, round);
}

export async function confirmAssignment(
  groupId: string,
  round: AssignmentRound,
) {
  await mockDelay(350);
  const result = getAssignmentResult(groupId, round);
  if (!result) {
    throw new Error("확정할 조 편성 결과가 없습니다.");
  }

  return result;
}

export async function saveFixedMembers(
  groupId: string,
  round: AssignmentRound,
  fixedMembers: FixedMemberEntry[],
) {
  await mockDelay(300);
  saveFixedMembersDraft(groupId, round, fixedMembers);
  return fixedMembers;
}
