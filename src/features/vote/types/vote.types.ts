import type { Gender } from "@/shared/types/gender.types";

export type VoteStatus = "OPEN" | "CLOSED";
export type AttendanceChoice = "ATTEND" | "ABSENT";
export type VoteStatusFilter = AttendanceChoice | "PENDING";

export interface VoteStatusMember {
  memberId: string;
  memberName: string;
  gender: Gender;
  attendanceStatus: VoteStatusFilter;
}

export interface VoteProgressContext {
  status: VoteStatus;
  currentMemberId: string;
  totalCount: number;
  completedCount: number;
  attendanceCount: number;
  absenceCount: number;
  pendingCount: number;
  attendanceMembers: VoteStatusMember[];
  absenceMembers: VoteStatusMember[];
  pendingMembers: VoteStatusMember[];
}
