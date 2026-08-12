export type AssignmentRound = 1 | 2;

export type AssignmentStatus = "DRAFT" | "PROCESSING" | "COMPLETED";

export interface AssignmentConditionOption {
  key: "GENDER_BALANCE" | "GRADE_BALANCE" | "ADMIN_DISTRIBUTION";
  label: string;
}

export interface AssignmentSetupInput {
  round: AssignmentRound;
  groupCount: number;
  conditionKeys: AssignmentConditionOption["key"][];
}

export interface FixedMemberEntry {
  memberId: string;
  memberName: string;
  teamNumber: number;
}

export interface AssignmentMember {
  memberId: string;
  memberName: string;
  profileImage: string | null;
}

export interface AssignmentTeam {
  teamId: string;
  teamNumber: number;
  members: AssignmentMember[];
}

export interface AssignmentResult {
  round: AssignmentRound;
  status: AssignmentStatus;
  teams: AssignmentTeam[];
}

export interface AssignmentWarning {
  code: string;
  message: string;
}
