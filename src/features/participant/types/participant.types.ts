export type ParticipantVisibility = "public" | "private";
export type ParticipantRole = "general" | "staff";
export type ParticipantGender = "male" | "female";
export type ParticipantViewMode = "all" | "team";

export type ProfileGrade = "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "OTHER";
export type ProfilePosition = "STAFF" | "MEMBER";
export type ProfileVisibility = "PUBLIC" | "PRIVATE";
export type ProfileGender = "MALE" | "FEMALE";
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

export type Participant = {
  id: string;
  name: string;
  department: string;
  visibility: ParticipantVisibility;
  role: ParticipantRole;
  gender: ParticipantGender;
  grade?: string;
  isNew?: boolean;
  mbti?: string;
  age?: number;
  instagramId?: string;
  bio?: string;
};

export type ParticipantTeam = {
  teamNumber: number;
  members: Participant[];
};

export type ParticipantGroup = {
  groupName: string;
  participants: Participant[];
  teams: ParticipantTeam[];
};

export type ParticipantProfile = Participant & {
  grade: string;
  mbti: string;
  age?: number;
  instagramId?: string;
  bio?: string;
  isNew: boolean;
};

export type AdminParticipant = ParticipantProfile;

export type AdminParticipantGroup = {
  groupName: string;
  participants: AdminParticipant[];
};

export type ParticipantProfileRequest = {
  displayName: string;
  position: ProfilePosition;
  major: string;
  isNew: boolean;
  grade: ProfileGrade;
  gender: ProfileGender;
  mbti: ProfileMbti;
  age?: number | null;
  instaId?: string | null;
  bio?: string | null;
  visibility: ProfileVisibility;
};

export type ParticipantSummaryResponse = {
  participantId: number;
  displayName: string;
  major: string;
  gender: ProfileGender;
  visibility: ProfileVisibility;
  grade?: ProfileGrade;
  isNew?: boolean;
  position?: ProfilePosition;
  mbti?: ProfileMbti;
  age?: number | null;
  instaId?: string | null;
  bio?: string | null;
};

export type ParticipantListResponse = {
  participantList: ParticipantSummaryResponse[];
};

export type ParticipantProfileResponse = {
  displayName: string;
  grade: ProfileGrade;
  gender: ProfileGender;
  major: string;
  isNew: boolean;
  position: ProfilePosition;
  mbti: ProfileMbti;
  age?: number | null;
  instaId?: string | null;
  bio?: string | null;
};
