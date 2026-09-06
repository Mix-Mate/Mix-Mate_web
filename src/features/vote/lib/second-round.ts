export const SECOND_ROUND_MIN_PARTICIPANTS = 8;
export const SECOND_ROUND_VOTE_UPDATED_MESSAGE = "투표가 정정 되었습니다";

export function getSecondRoundVoteUpdatedToastKey(groupId: string) {
  return `mixmate:second-round-vote-updated-toast:${groupId}`;
}
