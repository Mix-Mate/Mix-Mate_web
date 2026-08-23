import type { GroupStatus } from "../types/group.types";
import type {
  EventStatus,
  GroupRound,
} from "@/features/session/types/session.types";

const groupStatusLabels: Record<GroupStatus, string> = {
  RECRUITING: "그룹 모집 중",
  BEFORE_FIRST_ROUND: "1차 준비 중",
  FIRST_ROUND: "1차 진행 중",
  VOTING: "투표 진행 중",
  VOTE_CLOSED: "투표 종료",
  BEFORE_SECOND_ROUND: "2차 준비 중",
  SECOND_ROUND: "2차 진행 중",
  FINISHED: "모임 종료",
};

const eventStatusByGroupStatus: Record<GroupStatus, EventStatus> = {
  RECRUITING: "RECRUITING",
  BEFORE_FIRST_ROUND: "FIRST_PREPARING",
  FIRST_ROUND: "FIRST_IN_PROGRESS",
  VOTING: "SECOND_VOTING",
  VOTE_CLOSED: "SECOND_VOTING",
  BEFORE_SECOND_ROUND: "SECOND_PREPARING",
  SECOND_ROUND: "SECOND_IN_PROGRESS",
  FINISHED: "COMPLETED",
};

export function getGroupStatusLabel(status: GroupStatus) {
  return groupStatusLabels[status];
}

export function toEventStatus(status: GroupStatus) {
  return eventStatusByGroupStatus[status];
}

export function getCurrentGroupRound(status: GroupStatus): GroupRound {
  return status === "BEFORE_SECOND_ROUND" || status === "SECOND_ROUND" ? 2 : 1;
}

export function getPreparationRound(status: GroupStatus): GroupRound | null {
  if (status !== "BEFORE_FIRST_ROUND" && status !== "BEFORE_SECOND_ROUND") {
    return null;
  }

  return getCurrentGroupRound(status);
}
