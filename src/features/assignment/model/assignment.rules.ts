import type {
  AssignmentConditionKey,
  AssignmentTeam,
  AssignmentWarning,
  FixedMemberCandidate,
} from "../types/assignment.types";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function assignTeams(
  candidates: FixedMemberCandidate[],
  groupCount: number,
): AssignmentTeam[] {
  const teams: AssignmentTeam[] = Array.from(
    { length: groupCount },
    (_, index) => ({ teamNumber: index + 1, members: [] }),
  );

  const unfixed: FixedMemberCandidate[] = [];

  for (const candidate of candidates) {
    const team =
      candidate.fixedTeamNumber !== null
        ? teams[candidate.fixedTeamNumber - 1]
        : undefined;

    if (team) {
      team.members.push(candidate);
    } else {
      unfixed.push(candidate);
    }
  }

  for (const candidate of shuffle(unfixed)) {
    const smallestTeam = teams.reduce((smallest, team) =>
      team.members.length < smallest.members.length ? team : smallest,
    );
    smallestTeam.members.push(candidate);
  }

  return teams;
}

function isTeamHomogeneous(
  team: AssignmentTeam,
  getValue: (member: FixedMemberCandidate) => string,
): boolean {
  if (team.members.length < 2) return false;

  const [first, ...rest] = team.members;
  const value = getValue(first);

  return rest.every((member) => getValue(member) === value);
}

function checkBalance(
  teams: AssignmentTeam[],
  conditionKey: AssignmentConditionKey,
  message: string,
  getValue: (member: FixedMemberCandidate) => string,
): AssignmentWarning[] {
  const isViolated = teams.some((team) => isTeamHomogeneous(team, getValue));
  return isViolated ? [{ conditionKey, message }] : [];
}

function checkAdminDistribution(teams: AssignmentTeam[]): AssignmentWarning[] {
  return teams
    .filter(
      (team) =>
        team.members.length > 0 &&
        !team.members.some((member) => member.role === "staff"),
    )
    .map((team) => ({
      conditionKey: "ADMIN_DISTRIBUTION",
      message: `${team.teamNumber}조에 운영진(직급)이 없습니다`,
    }));
}

function checkMemberCountBalance(
  teams: AssignmentTeam[],
): AssignmentWarning[] {
  const counts = teams.map((team) => team.members.length);
  const max = Math.max(...counts);
  const min = Math.min(...counts);

  return max - min > 1
    ? [
        {
          conditionKey: "MEMBER_COUNT_BALANCE",
          message: `조별 인원 차이가 큽니다 (최대 ${max}명, 최소 ${min}명)`,
        },
      ]
    : [];
}

type ConditionChecker = (teams: AssignmentTeam[]) => AssignmentWarning[];

const conditionCheckers: Partial<Record<AssignmentConditionKey, ConditionChecker>> = {
  GENDER_BALANCE: (teams) =>
    checkBalance(
      teams,
      "GENDER_BALANCE",
      "성별 균형이 기준에 미달합니다",
      (member) => member.gender,
    ),
  MBTI_BALANCE: (teams) =>
    checkBalance(
      teams,
      "MBTI_BALANCE",
      "MBTI 균형이 기준에 미달합니다",
      (member) => member.mbti[0],
    ),
  GRADE_DISTRIBUTION: (teams) =>
    checkBalance(
      teams,
      "GRADE_DISTRIBUTION",
      "학년 분산이 기준에 미달합니다",
      (member) => member.grade,
    ),
  AFFILIATION_DISTRIBUTION: (teams) =>
    checkBalance(
      teams,
      "AFFILIATION_DISTRIBUTION",
      "소속 분산이 기준에 미달합니다",
      (member) => member.department,
    ),
  NEWCOMER_DISTRIBUTION: (teams) =>
    checkBalance(
      teams,
      "NEWCOMER_DISTRIBUTION",
      "신입 여부 분산이 기준에 미달합니다",
      (member) => String(member.isNew),
    ),
  ADMIN_DISTRIBUTION: checkAdminDistribution,
  MEMBER_COUNT_BALANCE: checkMemberCountBalance,
};

export function evaluateAssignmentWarnings(
  teams: AssignmentTeam[],
  conditionKeys: AssignmentConditionKey[],
): AssignmentWarning[] {
  return conditionKeys.flatMap(
    (conditionKey) => conditionCheckers[conditionKey]?.(teams) ?? [],
  );
}
