import type { TeamMemberSummary } from "@/features/team/types/team.types";
import type { VoteStatus } from "../types/vote.types";

export function getEligibleMvpCandidates(
  members: TeamMemberSummary[],
  currentMemberId: string,
) {
  return members.filter((member) => member.id !== currentMemberId);
}

export function assertVoteOpen(status: VoteStatus) {
  if (status === "CLOSED") {
    throw new Error("투표가 마감되어 수정할 수 없습니다.");
  }
}

export function assertNotSubmitted(hasSubmitted: boolean) {
  if (hasSubmitted) {
    throw new Error("이미 투표를 완료했습니다.");
  }
}

export function assertEligibleCandidate(
  members: TeamMemberSummary[],
  voterId: string,
  candidateId: string,
) {
  const candidates = getEligibleMvpCandidates(members, voterId);

  if (!candidates.some((candidate) => candidate.id === candidateId)) {
    throw new Error("현재 같은 조에 속한 팀원에게만 투표할 수 있습니다.");
  }
}
