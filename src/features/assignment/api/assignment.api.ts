import type {
  AssignmentMember,
  AssignmentProgressStatus,
} from "../types/assignment.types";

const PROCESSING_DURATION_MS = 6000;

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

export function getParticipantPool(): AssignmentMember[] {
  return participantMocks;
}

export function getAssignmentStatus(
  startedAt: number,
): AssignmentProgressStatus {
  const elapsedMs = Date.now() - startedAt;
  const progress = Math.min(
    100,
    Math.round((elapsedMs / PROCESSING_DURATION_MS) * 100),
  );

  return { progress, isComplete: progress >= 100 };
}
