export interface AdminGroupPreparation {
  id: string;
  name: string;
  inviteCode: string;
  participantCount: number;
  roleLabel: "관리자";
  statusLabel: string;
}
