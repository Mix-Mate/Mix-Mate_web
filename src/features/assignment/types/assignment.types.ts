export type AssignmentRound = 1 | 2;

export type AssignmentStatus = "DRAFT" | "PROCESSING" | "COMPLETED";

export type AssignmentConditionKey =
  | "GENDER_BALANCE"
  | "MBTI_BALANCE"
  | "GRADE_DISTRIBUTION"
  | "AFFILIATION_DISTRIBUTION"
  | "NEWCOMER_DISTRIBUTION"
  | "ADMIN_DISTRIBUTION"
  | "MEMBER_COUNT_BALANCE"
  | "KEEP_FIXED_MEMBERS";

export interface AssignmentConditionOption {
  key: AssignmentConditionKey;
  label: string;
  description: string;
  defaultEnabled: boolean;
}

export interface AssignmentSetupInput {
  round: AssignmentRound;
  groupCount: number;
  conditionKeys: AssignmentConditionKey[];
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
