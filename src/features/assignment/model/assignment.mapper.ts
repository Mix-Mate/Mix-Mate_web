import type { Gender } from "@/shared/types/gender.types";
import type {
  AssignmentConditionKey,
  AssignmentRound,
  AssignmentTeam,
  BackendConditionKey,
  BackendGender,
  BackendRound,
  FixedMemberRequestItem,
  FixedMemberSelection,
} from "../types/assignment.types";

export function toBackendRound(round: AssignmentRound): BackendRound {
  return round === 2 ? "SECOND_ROUND" : "FIRST_ROUND";
}

export function toGender(gender: BackendGender): Gender {
  return gender === "FEMALE" ? "female" : "male";
}

// 고정 멤버 유지(KEEP_FIXED_MEMBERS)는 조건이 아니라 fixedMembers 배열로 표현된다.
const conditionKeyMap: Partial<
  Record<AssignmentConditionKey, BackendConditionKey>
> = {
  GENDER_BALANCE: "GENDER_BALANCE",
  MBTI_BALANCE: "MBTI_BALANCE",
  GRADE_DISTRIBUTION: "GRADE_SPREAD",
  NEWCOMER_DISTRIBUTION: "NEWCOMER_SPREAD",
  ADMIN_DISTRIBUTION: "POSITION_SPREAD",
};

export function toBackendConditions(
  conditionKeys: AssignmentConditionKey[],
): BackendConditionKey[] {
  return conditionKeys
    .map((key) => conditionKeyMap[key])
    .filter((key): key is BackendConditionKey => key !== undefined);
}

export function toFixedMembersRequest(
  selection: FixedMemberSelection,
): FixedMemberRequestItem[] {
  return Object.entries(selection).map(([participantId, teamNumber]) => ({
    participantId: Number(participantId),
    teamNumber,
  }));
}

// 이전 회차 확정 결과를 그대로 고정 멤버로 이어받을 때 사용 (2차의 "고정 멤버 유지").
export function toFixedMembersFromTeams(
  teams: AssignmentTeam[],
): FixedMemberRequestItem[] {
  return teams.flatMap((team) =>
    team.members.map((member) => ({
      participantId: member.participantId,
      teamNumber: team.teamNumber,
    })),
  );
}
