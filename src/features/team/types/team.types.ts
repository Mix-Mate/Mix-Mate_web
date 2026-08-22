import type { Gender } from "@/shared/types/gender.types";

export type ProfileVisibility = "PUBLIC" | "PRIVATE";
export type TeamMemberGender = "MALE" | "FEMALE";

export type TeamRound = "FIRST_ROUND" | "SECOND_ROUND";

export interface TeamMember {
  participantId: number;
  displayName: string;
  major: string;
  gender: TeamMemberGender;
  visibility: ProfileVisibility;
  fixed: boolean;
}

export interface Team {
  teamNumber: number;
  members: TeamMember[];
}

export interface MyTeamResponse {
  round: TeamRound;
  team: Team;
}

// MVP 투표 Mock이 사용하는 기존 화면 모델입니다.
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
