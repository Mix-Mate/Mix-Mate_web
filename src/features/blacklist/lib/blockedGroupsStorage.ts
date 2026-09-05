export interface BlockedGroupStorageItem {
  groupId: string;
  groupName: string;
  reason?: string;
  blockedAt?: string;
}

const STORAGE_KEY = "mixmate_blocked_groups";

function isDummyReason(reason?: string): boolean {
  if (!reason) return true;
  const trimmed = reason.trim();
  return (
    trimmed === "" ||
    trimmed === "관리자에 의해 해당 그룹에서 차단되었습니다." ||
    trimmed === "이 그룹에 참여하고 있지 않거나 차단되었습니다." ||
    trimmed === "해당 그룹 관리자에 의해 참여가 차단된 사용자입니다." ||
    trimmed === "차단되어 입장할 수 없습니다." ||
    trimmed === "등록된 차단 사유가 없습니다."
  );
}

/**
 * 로컬에 저장된 차단 그룹 목록 조회
 */
export function readBlockedGroups(): BlockedGroupStorageItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      reason: isDummyReason(item.reason) ? undefined : item.reason?.trim(),
    }));
  } catch {
    return [];
  }
}

/**
 * 차단된 그룹 정보를 로컬에 기록 (홈 화면 유지용)
 */
export function recordBlockedGroup(item: BlockedGroupStorageItem): void {
  if (typeof window === "undefined" || !item.groupId) return;
  try {
    const list = readBlockedGroups();
    const existingIndex = list.findIndex(
      (g) => String(g.groupId) === String(item.groupId),
    );
    const cleanReason = isDummyReason(item.reason)
      ? undefined
      : item.reason?.trim();
    const incomingGroupName = item.groupName?.trim();
    const newItem: BlockedGroupStorageItem = {
      groupId: String(item.groupId),
      groupName:
        incomingGroupName && incomingGroupName !== "그룹"
          ? incomingGroupName
          : "그룹",
      reason: cleanReason,
      blockedAt: item.blockedAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      list[existingIndex] = {
        ...existing,
        ...newItem,
        groupName:
          incomingGroupName && incomingGroupName !== "그룹"
            ? incomingGroupName
            : existing.groupName || "그룹",
        reason: cleanReason || existing.reason,
        blockedAt: newItem.blockedAt || existing.blockedAt,
      };
    } else {
      list.push(newItem);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/**
 * 사용자가 홈 화면에서 삭제 시 로컬 기록에서 제거
 */
export function removeBlockedGroup(groupId: string): void {
  if (typeof window === "undefined" || !groupId) return;
  try {
    const list = readBlockedGroups().filter(
      (g) => String(g.groupId) !== String(groupId),
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/**
 * 로컬 차단 그룹 목록 초기화
 */
export function clearBlockedGroups(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
