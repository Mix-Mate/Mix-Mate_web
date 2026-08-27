import type { GroupDetail, UpdateGroupRequest } from "../types/group.types";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export interface CreateGroupRequest {
  groupName: string;
  description?: string;
}

export interface CreateGroupResponse {
  groupId: number | string;
  groupName: string;
  inviteCode: string;
}

export function createMockGroupDetail(groupId: string): GroupDetail {
  const numericId = parseInt(groupId, 10);
  return {
    groupId: isNaN(numericId) ? 1 : numericId,
    groupName: "모임",
    description: "진행 중인 모임입니다.",
    status: "BEFORE_FIRST_ROUND",
    inviteCode: typeof groupId === "string" ? groupId.toUpperCase() : "ABC1234",
    createdAt: new Date().toISOString(),
    memberCount: 8,
    myRole: "HOST",
    myParticipantId: 1,
  };
}

export async function createGroup(
  request: CreateGroupRequest,
): Promise<CreateGroupResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups`, {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return {
        groupId: 1,
        groupName: request.groupName,
        inviteCode: "7K2M91",
      };
    }

    return (await response.json()) as CreateGroupResponse;
  } catch {
    return {
      groupId: 1,
      groupName: request.groupName,
      inviteCode: "7K2M91",
    };
  }
}

export async function getGroupDetail(groupId: string): Promise<GroupDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
      credentials: "include",
      headers: withAuthHeaders(),
    });

    if (!response.ok) {
      return createMockGroupDetail(groupId);
    }

    return (await response.json()) as GroupDetail;
  } catch {
    return createMockGroupDetail(groupId);
  }
}

export async function closeRecruiting(groupId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/close-recruiting`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "참가자 모집 마감에 실패했습니다."),
    );
  }
}

export async function finishFirstRound(groupId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/voting`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "1차 종료에 실패했습니다."),
    );
  }
}

export async function decideSecondRound(groupId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/second-round`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "2차 진행 결정에 실패했습니다."),
    );
  }
}

export async function updateGroup(
  groupId: string,
  request: UpdateGroupRequest,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
    method: "PUT",
    credentials: "include",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "그룹 정보 수정에 실패했습니다."),
    );
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
    method: "DELETE",
    credentials: "include",
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "그룹 삭제에 실패했습니다."),
    );
  }
}

export interface JoinGroupResponse {
  groupId: string;
  groupName?: string;
}

export class GroupApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "GroupApiError";
    this.status = status;
    this.code = code;
  }
}

export async function joinGroupByCode(
  inviteCode: string,
): Promise<JoinGroupResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/invitations/join`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
    },
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "참여코드가 존재하지 않습니다.",
    );
    let code: string | undefined;
    try {
      const data = (await response.clone().json()) as {
        code?: string;
        message?: string;
      };
      code = data.code;
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    throw new GroupApiError(message, response.status, code);
  }

  return (await response.json()) as JoinGroupResponse;
}

export interface GetMyGroupsRequest {
  scope: "me";
  state?: "active" | "finished";
}

export interface MyGroupItem {
  groupId: number;
  groupName: string;
  status: string; // 'RECRUITING' | 'PROGRESS' | 'FINISHED' | string
  memberCount: number;
  role: string; // 'HOST' | 'MEMBER' | string
}

export interface GetMyGroupsResponse {
  groups: MyGroupItem[];
}

/**
 * 내 그룹 목록 조회 API
 * GET /api/v1/groups?scope=me&state=active|finished
 */
export async function getMyGroupsApi(
  params: GetMyGroupsRequest = { scope: "me" },
): Promise<GetMyGroupsResponse> {
  const query = new URLSearchParams({
    scope: params.scope,
    ...(params.state ? { state: params.state } : {}),
  }).toString();

  const response = await fetch(`${API_BASE_URL}/api/v1/groups?${query}`, {
    method: "GET",
    credentials: "include",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    let errorData: { code?: string; message?: string } | null = null;
    try {
      errorData = (await response.clone().json()) as {
        code?: string;
        message?: string;
      };
    } catch {
      // Non-JSON fallback
    }

    const defaultMessage =
      response.status === 400
        ? "입력값이 올바르지 않습니다."
        : response.status === 401
          ? "토큰이 없거나 만료되었습니다."
          : "그룹 목록 조회에 실패했습니다.";

    const message = errorData?.message || defaultMessage;
    throw new GroupApiError(message, response.status, errorData?.code);
  }

  return (await response.json()) as GetMyGroupsResponse;
}

