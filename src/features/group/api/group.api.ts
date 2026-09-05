import type {
  GroupDetail,
  GroupStatus,
  UpdateGroupRequest,
} from "../types/group.types";
import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { saveKnownGroupName } from "@/features/blacklist/lib/blockedGroupsStorage";

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
  reason?: string;
  groupName?: string;

  constructor(
    message: string,
    status?: number,
    code?: string,
    fieldErrors?: Record<string, string>,
    reason?: string,
    groupName?: string,
  ) {
    super(message);
    this.name = "GroupApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.reason = reason;
    this.groupName = groupName;
  }
}

export function extractErrorGroupName(errorData: unknown): string | undefined {
  if (!errorData || typeof errorData !== "object") return undefined;
  const dataObj = errorData as Record<string, unknown>;
  const nestedData =
    typeof dataObj.data === "object" && dataObj.data !== null
      ? (dataObj.data as Record<string, unknown>)
      : undefined;
  const nestedResult =
    typeof dataObj.result === "object" && dataObj.result !== null
      ? (dataObj.result as Record<string, unknown>)
      : undefined;

  const candidates = [
    dataObj.groupName,
    nestedData?.groupName,
    nestedResult?.groupName,
    dataObj.name,
    nestedData?.name,
    nestedResult?.name,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) {
      const trimmed = c.trim();
      if (
        trimmed !== "차단된 그룹" &&
        trimmed !== "차단된그룹" &&
        trimmed !== "차단된 모임" &&
        trimmed !== "그룹" &&
        trimmed !== "모임"
      ) {
        return trimmed;
      }
    }
  }
  return undefined;
}

export function extractErrorReason(errorData: unknown): string | undefined {
  if (!errorData) return undefined;
  if (typeof errorData === "string") {
    const trimmed = errorData.trim();
    if (!trimmed || isGenericErrorMessage(trimmed)) return undefined;
    const msgMatch = trimmed.match(/사유\s*[:：]\s*([^\n\r]+)/);
    if (msgMatch && msgMatch[1] && !isGenericErrorMessage(msgMatch[1].trim())) {
      return msgMatch[1].trim();
    }
    return trimmed;
  }
  if (typeof errorData === "object" && errorData !== null) {
    const dataObj = errorData as Record<string, unknown>;
    const nestedData =
      typeof dataObj.data === "object" && dataObj.data !== null
        ? (dataObj.data as Record<string, unknown>)
        : undefined;
    const nestedResult =
      typeof dataObj.result === "object" && dataObj.result !== null
        ? (dataObj.result as Record<string, unknown>)
        : undefined;
    const nestedError =
      typeof dataObj.error === "object" && dataObj.error !== null
        ? (dataObj.error as Record<string, unknown>)
        : undefined;

    const candidates = [
      dataObj.reason,
      nestedData?.reason,
      nestedResult?.reason,
      nestedError?.reason,
      dataObj.banReason,
      nestedData?.banReason,
      nestedResult?.banReason,
      nestedError?.banReason,
      dataObj.blockReason,
      nestedData?.blockReason,
      nestedResult?.blockReason,
      nestedError?.blockReason,
      dataObj.detail,
      nestedData?.detail,
      nestedResult?.detail,
      nestedError?.detail,
      dataObj.cause,
      nestedData?.cause,
    ];

    for (const c of candidates) {
      if (
        typeof c === "string" &&
        c.trim().length > 0 &&
        !isGenericErrorMessage(c.trim())
      ) {
        return c.trim();
      }
    }

    const messages = [
      dataObj.message,
      nestedData?.message,
      nestedResult?.message,
      nestedError?.message,
    ];
    for (const m of messages) {
      if (typeof m === "string" && m.trim().length > 0) {
        const match = m.match(/사유\s*[:：]\s*([^\n\r]+)/);
        if (match && match[1] && !isGenericErrorMessage(match[1].trim())) {
          return match[1].trim();
        }
      }
    }
  }
  return undefined;
}

function isGenericErrorMessage(str: string): boolean {
  return (
    str === "관리자에 의해 해당 그룹에서 차단되었습니다." ||
    str === "이 그룹에 참여하고 있지 않거나 차단되었습니다." ||
    str === "해당 그룹 관리자에 의해 참여가 차단된 사용자입니다." ||
    str === "차단되어 입장할 수 없습니다." ||
    str === "등록된 차단 사유가 없습니다." ||
    str === "FORBIDDEN" ||
    str === "USER_BLOCKED" ||
    str === "BLOCKED" ||
    str === "BANNED_USER"
  );
}

export async function createGroupApi(
  request: CreateGroupRequest,
): Promise<CreateGroupResponse> {
  const userName =
    (typeof window !== "undefined" &&
      window.localStorage.getItem("userName")) ||
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

  const response = await apiFetch(`${API_BASE_URL}/api/v1/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorData: {
      message?: string;
      code?: string;
      reason?: string;
      errors?: Record<string, string>;
    } | null = null;
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

    const reason = extractErrorReason(errorData);
    const groupName = extractErrorGroupName(errorData);

    throw new GroupApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
      reason,
      groupName,
    );
  }

  const result = (await response.json()) as CreateGroupResponse;
  if (result?.groupId && result?.groupName) {
    saveKnownGroupName(result.groupId, result.groupName);
  }
  return result;
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
  createdAt?: string;
  updatedAt?: string;
  finishedAt?: string;
  closedAt?: string;
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

  const response = await apiFetch(`${API_BASE_URL}/api/v1/groups?${query}`, {
    method: "GET",
  });

  if (!response.ok) {
    let errorData: { message?: string; code?: string; reason?: string } | null = null;
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

    const reason = extractErrorReason(errorData);

    throw new GroupApiError(
      message,
      response.status,
      errorData?.code,
      undefined,
      reason,
    );
  }

  return (await response.json()) as GetMyGroupsResponse;
}

export const createGroup = createGroupApi;

export async function getGroupDetail(groupId: string): Promise<GroupDetail> {
  let response: Response;

  try {
    response = await apiFetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
    });
  } catch {
    throw new GroupApiError("그룹 정보를 불러오지 못했습니다.");
  }

  if (!response.ok) {
    let errorData: { message?: string; code?: string; reason?: string } | null = null;
    try {
      errorData = (await response.json()) as { message?: string; code?: string; reason?: string };
    } catch {
      // Body may not be JSON
    }
    const message =
      errorData?.message ||
      (response.status === 403
        ? "이 그룹에 참여하고 있지 않거나 차단되었습니다."
        : response.status === 404
          ? "존재하지 않는 그룹입니다."
          : "그룹 정보를 불러오지 못했습니다.");

    const reason = extractErrorReason(errorData);
    const groupName = extractErrorGroupName(errorData);

    throw new GroupApiError(
      message,
      response.status,
      errorData?.code,
      undefined,
      reason,
      groupName,
    );
  }

  const detail = (await response.json()) as GroupDetail;
  if (detail?.groupId && detail?.groupName) {
    saveKnownGroupName(detail.groupId, detail.groupName);
  }
  return detail;
}

export async function closeRecruiting(groupId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/close-recruiting`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "참가자 모집 마감에 실패했습니다."),
    );
  }
}

export async function finishFirstRound(groupId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/voting`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "1차 종료에 실패했습니다."),
    );
  }
}

export async function decideSecondRound(groupId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/second-round`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "2차 진행 결정에 실패했습니다."),
    );
  }
}

export async function finishGroup(groupId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/finish`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "모임 종료에 실패했습니다."),
    );
  }
}

export async function updateGroup(
  groupId: string,
  request: UpdateGroupRequest,
): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "그룹 정보 수정에 실패했습니다."),
    );
  }
}

export async function deleteGroup(groupId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/api/v1/groups/${groupId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "그룹 삭제에 실패했습니다."),
    );
  }
}

export async function leaveGroup(groupId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/participants/me`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "그룹 탈퇴에 실패했습니다."),
    );
  }
}

export interface JoinGroupWithProfileRequest {
  inviteCode: string;
  profile: GroupProfileDto;
}

export interface JoinGroupResponse {
  groupId: number | string;
  groupName?: string;
}

/**
 * 그룹 입장(참여코드 + 프로필) API
 * POST /api/v1/groups/invitations/join
 */
export async function joinGroupWithProfileApi(
  request: JoinGroupWithProfileRequest,
): Promise<JoinGroupResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/invitations/join`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteCode: request.inviteCode.trim().toUpperCase(),
        profile: request.profile,
      }),
    },
  );

  if (!response.ok) {
    let errorData: {
      code?: string;
      message?: string;
      reason?: string;
      errors?: Record<string, string>;
    } | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON response fallback
    }

    const message =
      errorData?.message ||
      (response.status === 400
        ? "입력값이 올바르지 않습니다."
        : response.status === 401
          ? "토큰이 없거나 만료되었습니다."
          : response.status === 404
            ? "참여코드가 존재하지 않습니다."
            : response.status === 409
              ? "이미 마감되었거나 시작된 모임입니다."
              : "그룹 입장에 실패했습니다.");

    const reason = extractErrorReason(errorData);
    const groupName = extractErrorGroupName(errorData);

    throw new GroupApiError(
      message,
      response.status,
      errorData?.code,
      errorData?.errors,
      reason,
      groupName,
    );
  }

  const joinRes = (await response.json()) as JoinGroupResponse;
  if (joinRes?.groupId && joinRes?.groupName) {
    saveKnownGroupName(joinRes.groupId, joinRes.groupName);
  }
  return joinRes;
}

export async function joinGroupByCode(
  inviteCode: string,
  profile?: GroupProfileDto,
): Promise<JoinGroupResponse> {
  const defaultProfile: GroupProfileDto = {
    displayName: "참가자",
    position: "MEMBER",
    major: "기타",
    isNew: false,
    grade: "FIRST",
    gender: "MALE",
    mbti: "ENFP",
    age: 20,
    visibility: "PUBLIC",
  };

  return joinGroupWithProfileApi({
    inviteCode,
    profile: profile || defaultProfile,
  });
}

export interface VerifyInviteCodeRequest {
  inviteCode: string;
}

export interface VerifyInviteCodeResponse {
  groupId: number;
  groupName: string;
  status?: GroupStatus | string;
}

/**
 * 참여코드 검증 API
 * POST /api/v1/groups/invitations/verify
 */
export async function verifyInviteCodeApi(
  request: VerifyInviteCodeRequest,
): Promise<VerifyInviteCodeResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/invitations/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteCode: request.inviteCode.trim().toUpperCase(),
      }),
    },
  );

  if (!response.ok) {
    let errorData: { code?: string; message?: string; reason?: string } | null = null;
    try {
      errorData = (await response.clone().json()) as {
        code?: string;
        message?: string;
        reason?: string;
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
            : response.status === 409
              ? "이미 마감되었거나 시작된 모임입니다."
              : "참여코드 검증에 실패했습니다.";

    const message = errorData?.message || defaultMessage;
    const reason = extractErrorReason(errorData);
    const groupName = extractErrorGroupName(errorData);

    throw new GroupApiError(
      message,
      response.status,
      errorData?.code,
      undefined,
      reason,
      groupName,
    );
  }

  const verified = (await response.json()) as VerifyInviteCodeResponse;
  if (verified?.groupId && verified?.groupName) {
    saveKnownGroupName(verified.groupId, verified.groupName);
  }
  return verified;
}
