import type {
  ProfileGender,
  ProfileGrade,
  ProfileMbti,
  ProfileVisibility,
} from "@/features/profile/types/profile.types";

export interface MvpWinner {
  participantId: number;
  displayName: string;
  teamNumber: number;
  grade: ProfileGrade;
  mbti: ProfileMbti;
}

export interface SecondRoundParticipant {
  participantId: number;
  displayName: string;
  major: string;
  gender: ProfileGender;
  visibility: ProfileVisibility;
}

export interface VoteResultResponse {
  mvpWinners: MvpWinner[];
  secondRoundParticipants: SecondRoundParticipant[];
}
