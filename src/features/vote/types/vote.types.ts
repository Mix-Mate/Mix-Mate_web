import type { TeamMemberSummary } from "@/features/team/types/team.types";

export type VoteStatus = "OPEN" | "CLOSED";
export type AttendanceChoice = "ATTEND" | "ABSENT";
export type VoteStatusFilter = AttendanceChoice | "PENDING";
export type MvpCandidate = TeamMemberSummary;

export interface MvpVoteContext {
  status: VoteStatus;
  currentMemberId: string;
  candidates: MvpCandidate[];
  selectedCandidateId: string | null;
  hasSubmitted: boolean;
}

export interface AttendanceVoteContext {
  status: VoteStatus;
  selectedChoice: AttendanceChoice | null;
  hasSubmitted: boolean;
}

export interface MvpVoteSubmission {
  groupId: string;
  voterId: string;
  candidateId: string;
}

export interface AttendanceVoteSubmission {
  groupId: string;
  memberId: string;
  choice: AttendanceChoice;
}

export interface VoteStatusMember {
  memberId: string;
  memberName: string;
  avatarInitial: string;
  avatarColor: string;
  attendanceStatus: VoteStatusFilter;
}

export interface VoteProgressContext {
  status: VoteStatus;
  totalCount: number;
  completedCount: number;
  attendanceCount: number;
  absenceCount: number;
  pendingCount: number;
  attendanceMembers: VoteStatusMember[];
  absenceMembers: VoteStatusMember[];
  pendingMembers: VoteStatusMember[];
}

export interface MvpResultMember {
  memberId: string;
  memberName: string;
  avatarInitial: string;
  avatarColor: string;
  rank: number;
  voteCount: number;
  teamNumber: number;
  gradeLabel: string;
  mbti: string;
}

export interface VoteResultContext {
  status: VoteStatus;
  teamNumber: number;
  teamMvp: MvpResultMember;
  overallRanking: MvpResultMember[];
  attendanceCount: number;
  totalCount: number;
}
