export type UserHomeScenario =
  | "round1-waiting"
  | "round1-active"
  | "round2-waiting"
  | "round2-active";

export type GroupRole = "USER" | "ADMIN";

export type GroupRound = 1 | 2;

export interface GroupHomePermissions {
  canLeaveGroup: boolean;
  canEndRound: boolean;
}

export interface UserHomeSnapshot {
  scenario: UserHomeScenario;
  groupName: string;
  role: GroupRole;
  roleLabel: string;
  round: GroupRound;
  statusEyebrow: string;
  statusLabel: string;
  teamNumber: number | null;
  teamHistoryAvailable: boolean;
  permissions: GroupHomePermissions;
}

export interface EndRoundResult {
  groupId: string;
  endedRound: GroupRound;
  nextStatus: "VOTING" | "FINISHED";
}
