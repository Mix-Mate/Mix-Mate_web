export type ParticipantVisibility = "public" | "private";
export type ParticipantRole = "general" | "staff";
export type ParticipantGender = "male" | "female";
export type ParticipantViewMode = "all" | "team";

export type Participant = {
  id: string;
  name: string;
  department: string;
  visibility: ParticipantVisibility;
  role: ParticipantRole;
  gender: ParticipantGender;
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