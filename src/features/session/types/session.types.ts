export type UserHomeScenario =
  | "recruiting"
  | "round1-waiting"
  | "round1-active"
  | "voting"
  | "round2-waiting"
  | "round2-active"
  | "completed";

export type GroupRole = "USER" | "ADMIN";

export type GroupRound = 1 | 2;

export type EventStatus =
  | "RECRUITING"
  | "FIRST_PREPARING"
  | "FIRST_IN_PROGRESS"
  | "SECOND_VOTING"
  | "SECOND_PREPARING"
  | "SECOND_IN_PROGRESS"
  | "COMPLETED";

export interface GroupHomePermissions {
  canLeaveGroup: boolean;
  canEndRound: boolean;
  canEditProfile: boolean;
}

export interface UserHomeSnapshot {
  scenario: UserHomeScenario;
  groupName: string;
  role: GroupRole;
  roleLabel: string;
  round: GroupRound;
  statusEyebrow: string;
  currentStatus: EventStatus;
  teamNumber: number | null;
  teamHistoryAvailable: boolean;
  permissions: GroupHomePermissions;
}

export interface EndRoundResult {
  groupId: string;
  endedRound: GroupRound;
  nextStatus: "VOTING" | "FINISHED";
}
