import type {
  GroupRole,
  UserHomeScenario,
  UserHomeSnapshot,
} from "../types/session.types";

const baseSnapshot = {
  groupName: "2026 SW 동아리 MT",
  role: "USER",
  roleLabel: "사용자",
  statusEyebrow: "진행 상태 확인",
} as const;

const snapshots: Record<UserHomeScenario, UserHomeSnapshot> = {
  recruiting: {
    ...baseSnapshot,
    scenario: "recruiting",
    round: 1,
    currentStatus: "RECRUITING",
    teamNumber: null,
    teamHistoryAvailable: false,
    permissions: {
      canLeaveGroup: true,
      canEndRound: false,
      canEditProfile: true,
    },
  },
  "round1-waiting": {
    ...baseSnapshot,
    scenario: "round1-waiting",
    round: 1,
    currentStatus: "FIRST_PREPARING",
    teamNumber: null,
    teamHistoryAvailable: false,
    permissions: {
      canLeaveGroup: false,
      canEndRound: false,
      canEditProfile: false,
    },
  },
  "round1-active": {
    ...baseSnapshot,
    scenario: "round1-active",
    round: 1,
    currentStatus: "FIRST_IN_PROGRESS",
    teamNumber: 3,
    teamHistoryAvailable: false,
    permissions: {
      canLeaveGroup: false,
      canEndRound: false,
      canEditProfile: false,
    },
  },
  voting: {
    ...baseSnapshot,
    scenario: "voting",
    round: 1,
    currentStatus: "SECOND_VOTING",
    teamNumber: 3,
    teamHistoryAvailable: false,
    permissions: {
      canLeaveGroup: false,
      canEndRound: false,
      canEditProfile: false,
    },
  },
  "round2-waiting": {
    ...baseSnapshot,
    scenario: "round2-waiting",
    round: 2,
    currentStatus: "SECOND_PREPARING",
    teamNumber: null,
    teamHistoryAvailable: true,
    permissions: {
      canLeaveGroup: false,
      canEndRound: false,
      canEditProfile: false,
    },
  },
  "round2-active": {
    ...baseSnapshot,
    scenario: "round2-active",
    round: 2,
    currentStatus: "SECOND_IN_PROGRESS",
    teamNumber: 5,
    teamHistoryAvailable: true,
    permissions: {
      canLeaveGroup: false,
      canEndRound: false,
      canEditProfile: false,
    },
  },
  completed: {
    ...baseSnapshot,
    scenario: "completed",
    round: 2,
    currentStatus: "COMPLETED",
    teamNumber: 5,
    teamHistoryAvailable: true,
    permissions: {
      canLeaveGroup: false,
      canEndRound: false,
      canEditProfile: false,
    },
  },
};

export function getMockUserSession(
  scenario: string | undefined,
  role: GroupRole,
): UserHomeSnapshot {
  const snapshot =
    scenario && scenario in snapshots
      ? snapshots[scenario as UserHomeScenario]
      : snapshots["round1-active"];

  if (role === "USER") return snapshot;

  return {
    ...snapshot,
    role: "ADMIN",
    roleLabel: "관리자",
    permissions: {
      canLeaveGroup: false,
      canEndRound:
        snapshot.scenario === "round1-active" ||
        snapshot.scenario === "round2-active",
      canEditProfile: false,
    },
  };
}
