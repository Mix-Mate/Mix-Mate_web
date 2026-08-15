import type { Gender } from "@/shared/types/gender.types";

export type ProfileVisibility = "PUBLIC" | "PRIVATE";

export interface TeamMemberSummary {
  id: string;
  name: string;
  department: string;
  gender: Gender;
  profileVisibility: ProfileVisibility;
}

export interface MyTeamData {
  teamNumber: number;
  members: TeamMemberSummary[];
}
