export type ParticipantVisibility = "public" | "private";
export type ParticipantRole = "general" | "staff";

export type Participant = {
  id: string;
  name: string;
  department: string;
  initials: string;
  visibility: ParticipantVisibility;
  role: ParticipantRole;
  color: string;
};

export type ParticipantGroup = {
  groupName: string;
  participants: Participant[];
};
