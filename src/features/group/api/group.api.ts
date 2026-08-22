import type {
  AdminGroupPreparation,
  GroupStatus,
  UpdateGroupInput,
} from "../types/group.types";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
import { mockDelay } from "@/shared/api/mockDelay";
import {
  adminGroupPreparationMock,
  adminRoundTwoPreparationMock,
} from "./group.mock";

interface GroupDetailResponse {
  groupId: number;
  groupName: string;
  description?: string | null;
  status: GroupStatus;
  inviteCode: string;
  memberCount: number;
  myRole: "HOST" | "PARTICIPANT";
  myParticipantId: number;
}

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

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export function getAdminGroupPreparation(groupId: string) {
  return {
    ...adminGroupPreparationMock,
    id: groupId,
  };
}

export async function getAdminGroupDetail(
  groupId: string,
): Promise<AdminGroupPreparation> {
  const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
    credentials: "include",
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "그룹 정보를 불러오지 못했습니다."),
    );
  }

  const group = (await response.json()) as GroupDetailResponse;

  return {
    id: String(group.groupId),
    name: group.groupName,
    description: group.description ?? "",
    inviteCode: group.inviteCode,
    participantCount: group.memberCount,
    roleLabel: "관리자",
    status: group.status,
    statusLabel: groupStatusLabels[group.status],
  };
}

export function getAdminRoundTwoPreparation(groupId: string) {
  return {
    ...adminRoundTwoPreparationMock,
    id: groupId,
  };
}

export async function updateGroup(groupId: string, input: UpdateGroupInput) {
  await mockDelay();

  return {
    id: groupId,
    ...input,
  };
}

export async function deleteGroup(groupId: string) {
  void groupId;
  await mockDelay(350);
}
