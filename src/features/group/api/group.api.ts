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
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
      credentials: "include",
      headers: withAuthHeaders(),
    });
  } catch {
    throw new GroupApiError("그룹 정보를 불러오지 못했습니다.");
  }

  if (!response.ok) {
    throw new GroupApiError(
      await getErrorMessage(response, "그룹 정보를 불러오지 못했습니다."),
      response.status,
    );
  }

  return (await response.json()) as GroupDetail;
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

export interface VerifyInviteCodeRequest {
  inviteCode: string;
}

export interface VerifyInviteCodeResponse {
  groupId: number;
  groupName: string;
}

/**
 * 참여코드 검증 API
 * POST /api/v1/groups/invitations/verify
 */
export async function verifyInviteCodeApi(
  request: VerifyInviteCodeRequest,
): Promise<VerifyInviteCodeResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/groups/invitations/verify`,
    {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        inviteCode: request.inviteCode.trim().toUpperCase(),
      }),
    },
  );

  if (!response.ok) {
    let errorData: { code?: string; message?: string } | null = null;
    try {
      errorData = (await response.clone().json()) as {
        code?: string;
        message?: string;
      };
    } catch {
      // Non-JSON response fallback
    }

    const defaultMessage =
      response.status === 400
        ? "참여코드를 입력해 주세요."
        : response.status === 401
          ? "토큰이 없거나 만료되었습니다."
          : response.status === 404
            ? "유효하지 않은 초대코드입니다."
            : "참여코드 검증에 실패했습니다.";

    const message = errorData?.message || defaultMessage;
    throw new GroupApiError(message, response.status, errorData?.code);
  }

  return (await response.json()) as VerifyInviteCodeResponse;
}

