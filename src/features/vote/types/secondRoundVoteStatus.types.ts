import type { SecondRoundVoteChoice } from "./secondRoundVote.types";

export type SecondRoundVoteStatusFilter = SecondRoundVoteChoice | "PENDING";

export interface SecondRoundVoteParticipant {
  participantId: number;
  displayName: string;
  choice: SecondRoundVoteChoice | null;
}

export interface SecondRoundVoteStatusResponse {
  totalParticipantCount: number;
  votedCount: number;
  participateCount: number;
  notParticipateCount: number;
  participants: SecondRoundVoteParticipant[];
}
