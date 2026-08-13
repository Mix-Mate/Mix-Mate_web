import type { Participant } from "@/features/participant/types/participant.types";

export type AssignmentRound = 1 | 2;

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
  locked?: boolean;
}

export interface AssignmentSetupInput {
  round: AssignmentRound;
  groupCount: number;
  conditionKeys: AssignmentConditionKey[];
}

export interface FixedMemberCandidate extends Participant {
  grade: string;
  fixedTeamNumber: number | null;
}
