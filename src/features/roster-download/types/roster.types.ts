import type {
  BackendGender,
  BackendRound,
} from "@/features/assignment/types/assignment.types";
import type { ProfileGrade } from "@/features/participant/types/participant.types";

// GET /api/v1/groups/{groupId}/roster 응답 — 학번이 내려오는 유일한 조회.
// 관리자 전용이며, 모집 중에는 teamNumber가 모두 null이고 assigned가 false다.
export interface RosterMember {
  studentId: string;
  displayName: string;
  major: string;
  grade: ProfileGrade;
  gender: BackendGender;
  teamNumber: number | null;
}

export interface RosterRoundEntry {
  round: BackendRound;
  assigned: boolean;
  members: RosterMember[];
}

export interface RosterResponse {
  groupName: string;
  rounds: RosterRoundEntry[];
}
