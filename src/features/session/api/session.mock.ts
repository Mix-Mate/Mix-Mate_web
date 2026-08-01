import type {
  UserHomeScenario,
  UserHomeSnapshot,
} from "../types/session.types";

const baseSnapshot = {
  groupName: "2026 SW 동아리 MT",
  roleLabel: "사용자",
  statusEyebrow: "진행 상태 확인",
} as const;

const snapshots: Record<UserHomeScenario, UserHomeSnapshot> = {
  "round1-waiting": {
    ...baseSnapshot,
    scenario: "round1-waiting",
    statusLabel: "1차 술자리 중",
    teamNumber: null,
    teamHistoryAvailable: false,
    canLeaveGroup: true,
  },
  "round1-active": {
    ...baseSnapshot,
    scenario: "round1-active",
    statusLabel: "1차 술자리 중",
    teamNumber: 3,
    teamHistoryAvailable: false,
    canLeaveGroup: false,
  },
  "round2-waiting": {
    ...baseSnapshot,
    scenario: "round2-waiting",
    statusLabel: "2차 술자리 중",
    teamNumber: null,
    teamHistoryAvailable: true,
    canLeaveGroup: false,
  },
  "round2-active": {
    ...baseSnapshot,
    scenario: "round2-active",
    statusLabel: "2차 술자리 중",
    teamNumber: 5,
    teamHistoryAvailable: true,
    canLeaveGroup: false,
  },
};

export function getMockUserSession(scenario?: string): UserHomeSnapshot {
  if (scenario && scenario in snapshots) {
    return snapshots[scenario as UserHomeScenario];
  }

  return snapshots["round1-active"];
}
