export type GroupStatus =
  | "RECRUITING"
  | "BEFORE_FIRST_ROUND"
  | "FIRST_ROUND"
  | "VOTING"
  | "VOTE_CLOSED"
  | "BEFORE_SECOND_ROUND"
  | "SECOND_ROUND"
  | "FINISHED";

export type GroupMemberRole = "HOST" | "PARTICIPANT";

export interface GroupDetail {
  groupId: number;
  groupName: string;
  description: string | null;
  status: GroupStatus;
  inviteCode: string;
  memberCount: number;
  myRole: GroupMemberRole;
  myParticipantId: number;
}

export interface UpdateGroupInput {
  name: string;
  description: string;
}

export interface UpdateGroupRequest {
  groupName: string;
  description: string;
}
