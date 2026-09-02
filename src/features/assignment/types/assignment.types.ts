export type AssignmentRound = 1 | 2;
export type BackendRound = "FIRST_ROUND" | "SECOND_ROUND";

export type AssignmentConditionKey =
  | "GENDER_BALANCE"
  | "MBTI_BALANCE"
  | "GRADE_DISTRIBUTION"
  | "NEWCOMER_DISTRIBUTION"
  | "ADMIN_DISTRIBUTION"
  | "KEEP_FIXED_MEMBERS";

export type BackendConditionKey =
  | "GENDER_BALANCE"
  | "MBTI_BALANCE"
  | "GRADE_SPREAD"
  | "NEWCOMER_SPREAD"
  | "POSITION_SPREAD";

export type BackendGender = "MALE" | "FEMALE";

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

export interface AssignmentProgressStatus {
  progress: number;
  isComplete: boolean;
}

// 참가자 목록 조회(GET .../participants) 응답 항목 — 고정 멤버 선택 대상.
export interface ParticipantCandidate {
  participantId: number;
  displayName: string;
  major: string;
  gender: BackendGender;
  visibility: "PUBLIC" | "PRIVATE";
}

// 고정 멤버 지정 상태: participantId -> 지정한 조 번호.
export type FixedMemberSelection = Record<number, number>;

export interface FixedMemberRequestItem {
  participantId: number;
  teamNumber: number;
}

export interface TeamGenerateRequestBody {
  teamCount: number;
  conditions: BackendConditionKey[];
  fixedMembers: FixedMemberRequestItem[];
}

// 조 편성 실행/조회 응답의 멤버 — 실제 API는 이 필드만 내려준다
// (학년·MBTI·신입여부·직급은 내려주지 않음).
export interface TeamMemberDetail {
  participantId: number;
  displayName: string;
  major: string;
  gender: BackendGender;
  visibility: "PUBLIC" | "PRIVATE";
  fixed: boolean;
}

export interface AssignmentTeam {
  teamNumber: number;
  members: TeamMemberDetail[];
}

export interface TeamGenerateResponse {
  round: BackendRound;
  teams: AssignmentTeam[];
  warnings: string[];
}
