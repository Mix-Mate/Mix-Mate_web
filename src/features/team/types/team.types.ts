export type ProfileVisibility = "PUBLIC" | "PRIVATE";
export type TeamMemberGender = "male" | "female";

export interface TeamMemberSummary {
  id: string;
  name: string;
  department: string;
  gender: TeamMemberGender;
  avatarInitial: string;
  avatarColor: string;
  profileVisibility: ProfileVisibility;
}

export interface MyTeamData {
  teamNumber: number;
  members: TeamMemberSummary[];
}
