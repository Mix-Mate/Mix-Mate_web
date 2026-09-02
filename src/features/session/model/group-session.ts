import { toEventStatus } from "@/features/group/model/group-status";
import type {
  GroupDetail,
  GroupStatus,
} from "@/features/group/types/group.types";
import type {
  GroupRound,
  UserHomeScenario,
  UserHomeSnapshot,
} from "../types/session.types";

interface GroupSessionState {
  scenario: UserHomeScenario;
  round: GroupRound;
  teamHistoryAvailable: boolean;
}

const sessionStateByStatus: Record<GroupStatus, GroupSessionState> = {
  RECRUITING: {
    scenario: "recruiting",
    round: 1,
    teamHistoryAvailable: false,
  },
  BEFORE_FIRST_ROUND: {
    scenario: "round1-waiting",
    round: 1,
    teamHistoryAvailable: false,
  },
  FIRST_ROUND: {
    scenario: "round1-active",
    round: 1,
    teamHistoryAvailable: false,
  },
  VOTING: {
    scenario: "voting",
    round: 1,
    teamHistoryAvailable: false,
  },
  VOTE_CLOSED: {
    scenario: "voting",
    round: 1,
    teamHistoryAvailable: false,
  },
  BEFORE_SECOND_ROUND: {
    scenario: "round2-waiting",
    round: 2,
    teamHistoryAvailable: true,
  },
  SECOND_ROUND: {
    scenario: "round2-active",
    round: 2,
    teamHistoryAvailable: true,
  },
  FINISHED: {
    scenario: "completed",
    round: 2,
    teamHistoryAvailable: true,
  },
};

export function hasAssignedTeam(status: GroupStatus) {
  return (
    status === "FIRST_ROUND" ||
    status === "VOTING" ||
    status === "VOTE_CLOSED" ||
    status === "SECOND_ROUND"
  );
}

export function createGroupHomeSnapshot(
  group: GroupDetail,
): UserHomeSnapshot {
  const isAdmin = group.myRole === "HOST";
  const isParticipantWaitingAfterVote =
    !isAdmin && group.status === "VOTE_CLOSED";
  const sessionState = isParticipantWaitingAfterVote
    ? sessionStateByStatus.BEFORE_SECOND_ROUND
    : sessionStateByStatus[group.status];
  const isRecruiting = group.status === "RECRUITING";
  const isBeforeFirstRound = group.status === "BEFORE_FIRST_ROUND";
  const isRoundInProgress =
    group.status === "FIRST_ROUND" || group.status === "SECOND_ROUND";

  return {
    scenario: sessionState.scenario,
    groupName: group.groupName,
    role: isAdmin ? "ADMIN" : "USER",
    roleLabel: isAdmin ? "관리자" : "사용자",
    round: sessionState.round,
    statusEyebrow: "진행 상태 확인",
    currentStatus: toEventStatus(group.status),
    teamNumber: null,
    teamHistoryAvailable: sessionState.teamHistoryAvailable,
    permissions: {
      canLeaveGroup: !isAdmin && (isRecruiting || isBeforeFirstRound),
      canEndRound: isAdmin && isRoundInProgress,
      canEditProfile: isRecruiting,
    },
  };
}
