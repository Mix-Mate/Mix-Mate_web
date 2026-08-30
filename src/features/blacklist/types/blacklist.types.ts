import type {
  ParticipantGender,
  ParticipantRole,
  ParticipantVisibility,
} from "@/features/participant/types/participant.types";

export interface BanUserItem {
  userId: number;
  displayName: string;
  email: string;
  reason: string;
  bannedAt: string;
}

export interface BanListResponse {
  banList: BanUserItem[];
}

export interface BlockedParticipant {
  id: string;
  userId: number;
  name: string;
  displayName: string;
  email: string;
  reason: string;
  blockedAt: string;
  bannedAt: string;
  department?: string;
  gender?: ParticipantGender;
  role?: ParticipantRole;
  visibility?: ParticipantVisibility;
  grade?: string;
  mbti?: string;
  age?: number;
  instagramId?: string;
  bio?: string;
  isNew?: boolean;
}

export interface BlockedParticipantGroup {
  groupName: string;
  participants: BlockedParticipant[];
}

export interface BlockParticipantRequest {
  reason?: string;
}
