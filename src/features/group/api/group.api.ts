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

export interface GroupProfileDto {
  displayName: string;
  position: string; // 'STAFF' | 'MEMBER'
  major: string;
  isNew: boolean;
  grade: string; // 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH'
  gender: string; // 'MALE' | 'FEMALE'
  mbti: string;
  age: number;
  instaId?: string;
  bio?: string;
  visibility: string; // 'PUBLIC' | 'PRIVATE'
}

export interface CreateGroupRequest {
  groupName: string;
  description?: string;
  profile?: GroupProfileDto;
}

export interface CreateGroupResponse {
  groupId: number;
  groupName: string;
  inviteCode: string;
}

export class GroupApiError extends Error {
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status?: number,
    code?: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "GroupApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export async function createGroupApi(
  request: CreateGroupRequest,
): Promise<CreateGroupResponse> {
  const userName =
    (typeof window !== "undefined" && window.localStorage.getItem("userName")) ||
    "호스트";

  const defaultProfile: GroupProfileDto = {
    displayName: userName,
    position: "STAFF",
    major: "자유전공",
    isNew: false,
    grade: "FIRST",
    gender: "MALE",
    mbti: "ENFP",
    age: 20,
    visibility: "PUBLIC",
  };

  const payload: CreateGroupRequest = {
    groupName: request.groupName,
    description: request.description || "",
    profile: request.profile || defaultProfile,
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/groups`, {
    method: "POST",
    credentials: "include",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorData: { message?: string; code?: string; errors?: Record<string, string> } | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON fallback
    }

    const message =
      errorData?.message ||
      (response.status === 400
        ? "입력값이 올바르지 않습니다."
        : response.status === 401
          ? "토큰이 없거나 만료되었습니다."
          : "그룹 생성에 실패했습니다.");

    throw new GroupApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
    );
  }

  return (await response.json()) as CreateGroupResponse;
}

export interface GetMyGroupsRequest {
  scope?: "me";
  state?: "active" | "finished";
}

export interface MyGroupItem {
  groupId: number;
  groupName: string;
  status: string; // 'RECRUITING' | 'PROGRESS' | 'FINISHED' | 'FIRST_ROUND' | 'VOTING' | 'SECOND_ROUND'
  memberCount: number;
  role: string; // 'HOST' | 'MEMBER' | 'PARTICIPANT'
  date?: string;
  time?: string;
  location?: string;
}

export interface GetMyGroupsResponse {
  groups: MyGroupItem[];
}

/**
 * 내 그룹 목록 조회 API
 * GET /api/v1/groups?scope=me&state=active | finished
 */
export async function getMyGroupsApi(
  params: GetMyGroupsRequest = { scope: "me", state: "active" },
): Promise<GetMyGroupsResponse> {
  const query = new URLSearchParams({
    scope: params.scope || "me",
    state: params.state || "active",
  }).toString();

  const response = await fetch(`${API_BASE_URL}/api/v1/groups?${query}`, {
    method: "GET",
    credentials: "include",
    headers: withAuthHeaders(),
  });

  if (!response.ok) {
    let errorData: { message?: string; code?: string } | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON fallback
    }

    const message =
      errorData?.message ||
      (response.status === 400
        ? "입력값이 올바르지 않습니다."
        : response.status === 401
          ? "토큰이 없거나 만료되었습니다."
          : "그룹 목록을 불러오지 못했습니다.");

    throw new GroupApiError(message, response.status, errorData?.code);
  }

  return (await response.json()) as GetMyGroupsResponse;
}

export const createGroup = createGroupApi;

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
