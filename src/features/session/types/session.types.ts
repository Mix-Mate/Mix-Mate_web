export type UserHomeScenario =
  | "round1-waiting"
  | "round1-active"
  | "round2-waiting"
  | "round2-active";

export interface UserHomeSnapshot {
  scenario: UserHomeScenario;
  groupName: string;
  roleLabel: string;
  statusEyebrow: string;
  statusLabel: string;
  teamNumber: number | null;
  teamHistoryAvailable: boolean;
  canLeaveGroup: boolean;
}
