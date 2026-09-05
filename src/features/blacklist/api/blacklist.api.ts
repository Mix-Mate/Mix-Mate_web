import { getGroupDetail, GroupApiError } from "@/features/group/api/group.api";
import { apiFetch } from "@/shared/api/apiFetch";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import type {
  BanListResponse,
  BanUserItem,
  BlockedParticipant,
  BlockedParticipantGroup,
  BlockParticipantRequest,
} from "../types/blacklist.types";
import type { ParticipantProfile } from "@/features/participant/types/participant.types";

const BLACKLIST_STORAGE_PREFIX = "mixmate:group-blacklist:";

function getBlacklistStorageKey(groupId: string): string {
  return `${BLACKLIST_STORAGE_PREFIX}${groupId}`;
}

export function readStoredBlacklist(groupId: string): BlockedParticipant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getBlacklistStorageKey(groupId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BlockedParticipant[]) : [];
  } catch {
    return [];
  }
}

export function writeStoredBlacklist(
  groupId: string,
  list: BlockedParticipant[],
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getBlacklistStorageKey(groupId),
      JSON.stringify(list),
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function deduplicateBlacklist(
  list: BlockedParticipant[],
): BlockedParticipant[] {
  const map = new Map<string, BlockedParticipant>();
  for (const item of list) {
    let key = "";
    if (item.userId && item.userId > 0) {
      key = `user:${item.userId}`;
    } else if (item.id && item.id !== "0") {
      key = `id:${item.id}`;
    } else if (item.email) {
      key = `email:${item.email.trim().toLowerCase()}`;
    } else {
      key = `name:${(item.displayName || item.name).trim().toLowerCase()}`;
    }

    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const existing = map.get(key)!;
      map.set(key, {
        ...existing,
        ...item,
        email: item.email || existing.email || "",
        reason: item.reason || existing.reason || "",
        bannedAt:
          item.bannedAt ||
          existing.bannedAt ||
          item.blockedAt ||
          existing.blockedAt ||
          "",
        blockedAt:
          item.blockedAt ||
          existing.blockedAt ||
          item.bannedAt ||
          existing.bannedAt ||
          "",
      });
    }
  }
  return Array.from(map.values());
}

function mapBanUserItemToBlockedParticipant(
  item: BanUserItem | Record<string, unknown>,
): BlockedParticipant {
  const rawItem = item as Record<string, unknown>;
  const rawNested =
    typeof rawItem.data === "object" && rawItem.data !== null
      ? (rawItem.data as Record<string, unknown>)
      : undefined;

  const userId =
    Number(rawItem.userId || rawItem.id) || 0;
  const displayName =
    (typeof rawItem.displayName === "string" ? rawItem.displayName : "") ||
    (typeof rawItem.name === "string" ? rawItem.name : "") ||
    "사용자";
  const email = typeof rawItem.email === "string" ? rawItem.email : "";
  const reason =
    (typeof rawItem.reason === "string" ? rawItem.reason : "") ||
    (typeof rawNested?.reason === "string" ? rawNested.reason : "") ||
    (typeof rawItem.banReason === "string" ? rawItem.banReason : "") ||
    (typeof rawNested?.banReason === "string" ? rawNested.banReason : "") ||
    (typeof rawItem.blockReason === "string" ? rawItem.blockReason : "") ||
    (typeof rawNested?.blockReason === "string" ? rawNested.blockReason : "") ||
    (typeof rawItem.detail === "string" ? rawItem.detail : "") ||
    (typeof rawNested?.detail === "string" ? rawNested.detail : "") ||
    "";
  const bannedAt =
    (typeof rawItem.bannedAt === "string" ? rawItem.bannedAt : "") ||
    (typeof rawItem.blockedAt === "string" ? rawItem.blockedAt : "") ||
    new Date().toISOString();

  return {
    id: String(userId || rawItem.id || ""),
    userId,
    name: displayName,
    displayName,
    email,
    reason,
    blockedAt: bannedAt,
    bannedAt,
  };
}

/**
 * 2) 그룹 차단 목록 조회 API
 * GET /api/v1/groups/{groupId}/bans
 */
export async function getGroupBlacklist(
  groupId: string,
  signal?: AbortSignal,
): Promise<BlockedParticipantGroup> {
  const groupDetailPromise = getGroupDetail(groupId);

  try {
    const response = await apiFetch(
      `${API_BASE_URL}/api/v1/groups/${groupId}/bans`,
      {
        method: "GET",
        signal,
      },
    );

    if (response.ok) {
      const data: BanListResponse = await response.json();
      const rawBanList = Array.isArray(data?.banList)
        ? data.banList
        : Array.isArray(data)
          ? data
          : [];

      const serverList: BlockedParticipant[] = deduplicateBlacklist(
        rawBanList.map(mapBanUserItemToBlockedParticipant),
      );

      // 서버 응답으로 로컬 저장소 동기화 (기존 임의 목/더미 데이터 덮어쓰기 방지 및 정규화)
      writeStoredBlacklist(groupId, serverList);

      const group = await groupDetailPromise;
      return {
        groupName: group.groupName,
        participants: serverList,
      };
    }
  } catch {
    // Fallback to local storage only if network / API call fails
  }

  const storedList = deduplicateBlacklist(readStoredBlacklist(groupId));
  const group = await groupDetailPromise;
  return {
    groupName: group.groupName,
    participants: storedList,
  };
}

/**
 * 1) 참가자 삭제 및 그룹 차단 API
 * DELETE /api/v1/groups/{groupId}/participants/{participantId}?reason={reason}
 */
export async function blockParticipantApi(
  groupId: string,
  participant: ParticipantProfile | { id: string; name: string; email?: string },
  input: BlockParticipantRequest,
): Promise<{ ok: true; source: "api" }> {
  const reasonTrimmed = (input.reason || "").trim();

  // 프론트엔드 사전 유효성 검사 (최대 30자)
  if (reasonTrimmed.length > 30) {
    throw new Error("차단 사유는 30자를 넘을 수 없습니다.");
  }

  const queryParams = reasonTrimmed
    ? `?reason=${encodeURIComponent(reasonTrimmed)}`
    : "";

  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/participants/${participant.id}${queryParams}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok && response.status !== 204 && response.status !== 200) {
    let errorData: { message?: string } | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Body may be empty
    }

    if (response.status === 400) {
      throw new Error(errorData?.message || "차단 사유는 30자를 넘을 수 없습니다.");
    }
    if (response.status === 403) {
      throw new Error(errorData?.message || "권한이 없거나 관리자 본인은 삭제할 수 없습니다.");
    }
    if (response.status === 409) {
      throw new Error(errorData?.message || "1차 진행 이전(조 편성 전)에만 참가자를 삭제할 수 있습니다.");
    }

    throw new Error(errorData?.message || "참가자 차단에 실패했습니다.");
  }

  // 서버 응답이 성공(200/204)한 경우에만 로컬 캐시에 동기화 (가짜 이메일 목 생성 제거)
  const numericParticipantId = Number(participant.id) || 0;
  const realEmail = (participant as { email?: string }).email || "";
  const now = new Date().toISOString();

  const newBlocked: BlockedParticipant = {
    id: String(participant.id),
    userId: numericParticipantId,
    name: participant.name,
    displayName: participant.name,
    email: realEmail,
    reason: reasonTrimmed,
    blockedAt: now,
    bannedAt: now,
  };

  const current = readStoredBlacklist(groupId);
  const updated = deduplicateBlacklist([
    ...current.filter(
      (item) =>
        String(item.userId || item.id) !== String(participant.id) &&
        (!realEmail || item.email !== realEmail),
    ),
    newBlocked,
  ]);
  writeStoredBlacklist(groupId, updated);

  return { ok: true, source: "api" };
}

/**
 * 3) 그룹 차단 해제 API
 * DELETE /api/v1/groups/{groupId}/bans/{targetUserId}
 */
export async function unblockParticipantApi(
  groupId: string,
  targetUserId: number | string,
): Promise<{ ok: true; source: "api" }> {
  const targetIdStr = String(targetUserId);

  const response = await apiFetch(
    `${API_BASE_URL}/api/v1/groups/${groupId}/bans/${targetUserId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok && response.status !== 204 && response.status !== 200) {
    let errorData: { message?: string } | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Body may be empty
    }

    throw new Error(errorData?.message || "그룹 차단 해제에 실패했습니다.");
  }

  // 서버 응답이 성공(200/204)한 경우에만 로컬 캐시에서 제거
  const current = readStoredBlacklist(groupId);
  const updated = current.filter(
    (item) => String(item.userId || item.id) !== targetIdStr,
  );
  writeStoredBlacklist(groupId, updated);

  return { ok: true, source: "api" };
}

/**
 * 현재 사용자가 특정 그룹에서 차단되었는지 확인하는 함수
 */
export async function checkUserBlockedInGroup(
  groupId: string,
  userIdentifier?: { name?: string; email?: string; id?: string },
): Promise<BlockedParticipant | null> {
  const currentName =
    userIdentifier?.name ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("userName") ||
        window.localStorage.getItem("displayName") ||
        window.localStorage.getItem("name")
      : null);
  const currentEmail =
    userIdentifier?.email ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("email")
      : null);
  const currentId =
    userIdentifier?.id ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("userId")
      : null);

  // 1. 로컬 저장소 우선 확인 (차단 사유가 있는 경우 우선 반환)
  const localList = readStoredBlacklist(groupId);
  const localFound = localList.find(
    (item) =>
      (currentName &&
        (item.name?.trim() === currentName.trim() ||
          item.displayName?.trim() === currentName.trim())) ||
      (currentEmail && item.email && item.email.trim() === currentEmail.trim()) ||
      (currentId && String(item.userId || item.id) === String(currentId)),
  );
  if (localFound && localFound.reason) return localFound;

  // 2. getGroupDetail 호출하여 서버에서 403 차단 여부 및 사유 직접 확인 (일반 참가자용)
  try {
    await getGroupDetail(groupId);
  } catch (err: unknown) {
    if (err instanceof GroupApiError) {
      if (
        err.status === 403 ||
        err.code === "USER_BLOCKED" ||
        err.code === "BANNED_USER" ||
        err.code === "FORBIDDEN" ||
        err.code === "BLOCKED" ||
        err.message.includes("차단")
      ) {
        return {
          id: String(currentId || "0"),
          userId: Number(currentId) || 0,
          name: currentName || "사용자",
          displayName: currentName || "사용자",
          email: currentEmail || "",
          reason: err.reason || localFound?.reason || "",
          blockedAt: new Date().toISOString(),
          bannedAt: new Date().toISOString(),
        };
      }
    }
  }

  if (localFound) return localFound;

  // 3. 관리자용: getGroupBlacklist API 확인
  try {
    const groupData = await getGroupBlacklist(groupId);
    const serverFound = groupData.participants.find(
      (item) =>
        (currentName &&
          (item.name?.trim() === currentName.trim() ||
            item.displayName?.trim() === currentName.trim())) ||
        (currentEmail && item.email && item.email.trim() === currentEmail.trim()) ||
        (currentId && String(item.userId || item.id) === String(currentId)),
    );
    if (serverFound) return serverFound;
  } catch {
    // API 에러 시 무시
  }

  return null;
}
