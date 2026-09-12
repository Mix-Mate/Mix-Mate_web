export type ProfileGender = "MALE" | "FEMALE";
export type ProfileVisibility = "PUBLIC" | "PRIVATE";
export type ProfileGrade = "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "OTHER";
export type ProfilePosition = "STAFF" | "MEMBER";

export type ProfileMbti =
  | "ISTJ"
  | "ISFJ"
  | "INFJ"
  | "INTJ"
  | "ISTP"
  | "ISFP"
  | "INFP"
  | "INTP"
  | "ESTP"
  | "ESFP"
  | "ENFP"
  | "ENTP"
  | "ESTJ"
  | "ESFJ"
  | "ENFJ"
  | "ENTJ";

export type EditableGroupProfile = {
  displayName: string;
  position: ProfilePosition;
  major: string;
  isNew: boolean;
  grade: ProfileGrade;
  gender: ProfileGender;
  mbti: ProfileMbti;
  age: number | null;
  instaId: string | null;
  bio: string | null;
  visibility: ProfileVisibility;
};

export type MyGroupProfile = EditableGroupProfile & {
  id: string;
};

export type ParticipantProfileRequest = Omit<MyGroupProfile, "id">;

export type MyProfileResponse = Partial<EditableGroupProfile> & {
  participantId?: number;
  id?: number;
  name?: string;
  department?: string;
  instagramId?: string | null;
};

export interface RecentProfileResponse {
  displayName: string;
  studentId: string;
  position: "STAFF" | string;
  major: string;
  isNew: boolean;
  grade: "FIRST" | string;
  gender: "MALE" | "FEMALE" | string;
  mbti: string;
  age: number;
  instaId: string;
  bio: string;
  visibility: "PUBLIC" | "PRIVATE" | string;
}

