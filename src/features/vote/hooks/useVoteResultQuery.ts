import { getVoteResultContext } from "../api/vote.api";

export function useVoteResultQuery(groupId: string) {
  return {
    data: getVoteResultContext(groupId),
  };
}
