export type GroupStatus =
  | "RECRUITING"
  | "BEFORE_FIRST_ROUND"
  | "FIRST_ROUND"
  | "VOTING"
  | "VOTE_CLOSED"
  | "BEFORE_SECOND_ROUND"
  | "SECOND_ROUND"
  | "FINISHED";

export interface AdminGroupPreparation {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  participantCount: number;
  roleLabel: "관리자";
  status: GroupStatus;
  statusLabel: string;
}

export interface AdminRoundTwoPreparation {
  id: string;
  name: string;
  description: string;
  participantCount: number;
  roleLabel: "관리자";
  round: 2;
  statusLabel: string;
}

export interface UpdateGroupInput {
  name: string;
  description: string;
}
