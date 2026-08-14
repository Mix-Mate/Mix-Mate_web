export type ProfileGender = "MALE" | "FEMALE";
export type ProfileVisibility = "PUBLIC" | "PRIVATE";
export type ProfileGrade = "FIRST" | "SECOND" | "THIRD" | "FOURTH";
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
  major: string;
  grade: ProfileGrade;
  mbti: ProfileMbti;
  age: number | null;
  instaId: string | null;
  bio: string | null;
  visibility: ProfileVisibility;
};

export type MyGroupProfile = EditableGroupProfile & {
  id: string;
  position: ProfilePosition;
  isNew: boolean;
  gender: ProfileGender;
};

export type ParticipantProfileRequest = Omit<MyGroupProfile, "id">;
