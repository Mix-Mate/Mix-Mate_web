import type { VoteStatus } from "./vote.types";

export type SecondRoundVoteChoice = "PARTICIPATE" | "NOT_PARTICIPATE";

export interface AttendanceVoteContext {
  status: VoteStatus;
  selectedChoice: SecondRoundVoteChoice | null;
  hasSubmitted: boolean;
}
