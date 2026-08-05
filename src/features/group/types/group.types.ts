export interface AdminGroupPreparation {
  id: string;
  name: string;
  description: string;
  inviteCode: string;
  participantCount: number;
  roleLabel: "관리자";
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
