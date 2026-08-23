import type { ProfileVisibility } from "@/features/team/types/team.types";
import type { Gender } from "@/shared/types/gender.types";
import type { VoteStatus } from "./vote.types";

export interface MvpCandidate {
  participantId: number;
  name: string;
  department: string;
  gender: Gender;
  profileVisibility: ProfileVisibility;
}

export interface MvpVoteContext {
  status: VoteStatus;
  currentParticipantId: number | null;
  candidates: MvpCandidate[];
  selectedParticipantId: number | null;
  hasSubmitted: boolean;
}
