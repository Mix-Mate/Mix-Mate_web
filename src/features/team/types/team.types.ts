export type ProfileVisibility = "PUBLIC" | "PRIVATE";

export interface TeamMemberSummary {
  id: string;
  name: string;
  department: string;
  avatarInitial: string;
  avatarColor: string;
  profileVisibility: ProfileVisibility;
}

export interface MyTeamData {
  teamNumber: number;
  members: TeamMemberSummary[];
}
