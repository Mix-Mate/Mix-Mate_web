import { getGroupDetail } from "@/features/group/api/group.api";
import { API_BASE_URL } from "@/shared/api/apiBaseUrl";
import { withAuthHeaders } from "@/shared/api/authToken";
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

function mapBanUserItemToBlockedParticipant(
  item: BanUserItem | Record<string, unknown>,
): BlockedParticipant {
  const userId =
    Number(item.userId || (item as { id?: string | number }).id) || 0;
  const displayName =
    (item.displayName as string) ||
    (item as { name?: string }).name ||
    "사용자";
  const email = (item.email as string) || "";
  const reason = (item.reason as string) || "";
  const bannedAt =
    (item.bannedAt as string) ||
    (item as { blockedAt?: string }).blockedAt ||
    new Date().toISOString();

  return {
    id: String(userId || (item as { id?: string }).id || Math.random()),
    userId,
    name: displayName,
    displayName,
    email,
    reason,
    blockedAt: bannedAt,
    bannedAt,
    department: (item as { department?: string }).department,
    gender: (item as { gender?: BlockedParticipant["gender"] }).gender,
    role: (item as { role?: BlockedParticipant["role"] }).role,
    grade: (item as { grade?: string }).grade,
    mbti: (item as { mbti?: string }).mbti,
    age: (item as { age?: number }).age,
    instagramId: (item as { instagramId?: string }).instagramId,
    bio: (item as { bio?: string }).bio,
    isNew: (item as { isNew?: boolean }).isNew,
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
  const storedList = readStoredBlacklist(groupId);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/groups/${groupId}/bans`,
      {
        method: "GET",
        headers: withAuthHeaders(),
        credentials: "include",
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

      const serverList: BlockedParticipant[] = rawBanList.map(
        mapBanUserItemToBlockedParticipant,
      );

      // 병합 및 로컬 스토리지 동기화
      const mergedMap = new Map<string, BlockedParticipant>();
      storedList.forEach((item) => mergedMap.set(String(item.userId || item.id), item));
      serverList.forEach((item) => mergedMap.set(String(item.userId || item.id), item));
      const merged = Array.from(mergedMap.values());
      writeStoredBlacklist(groupId, merged);

      const group = await groupDetailPromise;
      return {
        groupName: group.groupName,
        participants: merged,
      };
    }
  } catch {
    // Fallback to local storage
  }

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
): Promise<{ ok: true; source: "api" | "local" }> {
  const reasonTrimmed = (input.reason || "").trim();

  // 프론트엔드 사전 유효성 검사 (최대 30자)
  if (reasonTrimmed.length > 30) {
    throw new Error("차단 사유는 30자를 넘을 수 없습니다.");
  }

  const numericParticipantId = Number(participant.id) || 0;
  const newBlocked: BlockedParticipant = {
    ...(participant as ParticipantProfile),
    id: String(participant.id),
    userId: numericParticipantId,
    name: participant.name,
    displayName: participant.name,
    email:
      (participant as { email?: string }).email ||
      `${participant.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
    reason: reasonTrimmed,
    blockedAt: new Date().toISOString(),
    bannedAt: new Date().toISOString(),
  };

  // 로컬 스토리지에 동기화
  const current = readStoredBlacklist(groupId);
  const updated = [
    ...current.filter((item) => String(item.userId || item.id) !== String(participant.id)),
    newBlocked,
  ];
  writeStoredBlacklist(groupId, updated);

  const queryParams = reasonTrimmed
    ? `?reason=${encodeURIComponent(reasonTrimmed)}`
    : "";

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/groups/${groupId}/participants/${participant.id}${queryParams}`,
      {
        method: "DELETE",
        headers: withAuthHeaders({
          "Content-Type": "application/json",
        }),
        credentials: "include",
      },
    );

    if (response.status === 204 || response.status === 200 || response.ok) {
      return { ok: true, source: "api" };
    }

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
  } catch (error) {
    if (error instanceof Error && error.message.includes("차단") || error instanceof Error && error.message.includes("권한") || error instanceof Error && error.message.includes("삭제")) {
      throw error;
    }
    // Return local success if network or backend route is mock environment
  }

  return { ok: true, source: "local" };
}

/**
 * 3) 그룹 차단 해제 API
 * DELETE /api/v1/groups/{groupId}/bans/{targetUserId}
 */
export async function unblockParticipantApi(
  groupId: string,
  targetUserId: number | string,
): Promise<{ ok: true; source: "api" | "local" }> {
  const targetIdStr = String(targetUserId);

  // 로컬 스토리지에서 삭제
  const current = readStoredBlacklist(groupId);
  const updated = current.filter(
    (item) => String(item.userId || item.id) !== targetIdStr,
  );
  writeStoredBlacklist(groupId, updated);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/groups/${groupId}/bans/${targetUserId}`,
      {
        method: "DELETE",
        headers: withAuthHeaders(),
        credentials: "include",
      },
    );

    if (response.status === 204 || response.status === 200 || response.ok) {
      return { ok: true, source: "api" };
    }

    let errorData: { message?: string } | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Body may be empty
    }

    throw new Error(errorData?.message || "그룹 차단 해제에 실패했습니다.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("차단 해제")) {
      throw error;
    }
    // Return local success if network or mock
  }

  return { ok: true, source: "local" };
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

  // 1. 로컬 저장소 우선 확인
  const localList = readStoredBlacklist(groupId);
  const localFound = localList.find(
    (item) =>
      (currentName && (item.name?.trim() === currentName.trim() || item.displayName?.trim() === currentName.trim())) ||
      (currentEmail && item.email && item.email.trim() === currentEmail.trim()) ||
      (currentId && String(item.userId || item.id) === String(currentId)),
  );
  if (localFound) return localFound;

  // 2. 서버 API 확인
  try {
    const groupData = await getGroupBlacklist(groupId);
    const serverFound = groupData.participants.find(
      (item) =>
        (currentName && (item.name?.trim() === currentName.trim() || item.displayName?.trim() === currentName.trim())) ||
        (currentEmail && item.email && item.email.trim() === currentEmail.trim()) ||
        (currentId && String(item.userId || item.id) === String(currentId)),
    );
    if (serverFound) return serverFound;
  } catch {
    // API 에러 시 무시
  }

  return null;
}
