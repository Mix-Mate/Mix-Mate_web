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

export type MyProfileResponse = EditableGroupProfile & {
  participantId?: number;
  id?: number;
};
