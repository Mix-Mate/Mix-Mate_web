export interface BlockedGroupStorageItem {
  groupId: string;
  groupName: string;
  reason?: string;
  blockedAt?: string;
}

const STORAGE_KEY = "mixmate_blocked_groups";
const KNOWN_NAMES_KEY = "mixmate_known_group_names";
const DISMISSED_KEY = "mixmate_dismissed_blocked_groups";

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
 * 더미/임시 그룹명인지 판별
 */
export function isDummyGroupName(name?: string | null): boolean {
  if (!name) return true;
  const trimmed = name.trim();
  return (
    trimmed === "" ||
    trimmed === "차단된 그룹" ||
    trimmed === "차단된그룹" ||
    trimmed === "차단된 모임" ||
    trimmed === "차단된모임" ||
    trimmed === "그룹" ||
    trimmed === "모임"
  );
}

/**
 * 알려진 그룹명 캐시에서 그룹명 조회
 */
export function getKnownGroupName(
  groupId: string | number,
): string | undefined {
  if (typeof window === "undefined" || !groupId) return undefined;
  const targetId = String(groupId);

  // 1. localStorage의 알려진 그룹명 맵 조회
  try {
    const raw = window.localStorage.getItem(KNOWN_NAMES_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map && typeof map === "object" && map[targetId]) {
        const candidate = String(map[targetId]).trim();
        if (!isDummyGroupName(candidate)) return candidate;
      }
    }
  } catch {
    // ignore
  }

  // 2. sessionStorage 개별 키 조회: groupName_${targetId}
  try {
    const sessionName = window.sessionStorage.getItem(`groupName_${targetId}`);
    if (sessionName && !isDummyGroupName(sessionName)) {
      return sessionName.trim();
    }
  } catch {
    // ignore
  }

  // 3. sessionStorage pendingGroupId 및 pendingGroupName 확인
  try {
    const pendingId = window.sessionStorage.getItem("pendingGroupId");
    const pendingName = window.sessionStorage.getItem("pendingGroupName");
    if (
      pendingId === targetId &&
      pendingName &&
      !isDummyGroupName(pendingName)
    ) {
      return pendingName.trim();
    }
  } catch {
    // ignore
  }

  // 4. URL searchParams 확인 (groupName 또는 name)
  try {
    if (typeof window.location !== "undefined" && window.location.search) {
      const sp = new URLSearchParams(window.location.search);
      const qName = sp.get("groupName") || sp.get("name");
      if (qName && !isDummyGroupName(qName)) {
        return qName.trim();
      }
    }
  } catch {
    // ignore
  }

  return undefined;
}

/**
 * 단일 그룹명을 알려진 그룹명 캐시에 저장
 */
export function saveKnownGroupName(
  groupId: string | number,
  groupName?: string | null,
): void {
  if (typeof window === "undefined" || !groupId || isDummyGroupName(groupName)) {
    return;
  }
  const targetId = String(groupId);
  const cleanName = groupName!.trim();

  try {
    const raw = window.localStorage.getItem(KNOWN_NAMES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[targetId] = cleanName;
    window.localStorage.setItem(KNOWN_NAMES_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }

  try {
    window.sessionStorage.setItem(`groupName_${targetId}`, cleanName);
  } catch {
    // ignore
  }
}

/**
 * 여러 그룹 목록을 알려진 그룹명 캐시에 일괄 저장
 */
export function saveKnownGroupNames(
  groups: Array<{ groupId: string | number; groupName?: string | null }>,
): void {
  if (typeof window === "undefined" || !Array.isArray(groups)) return;
  try {
    const raw = window.localStorage.getItem(KNOWN_NAMES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    let changed = false;

    for (const g of groups) {
      if (g && g.groupId && !isDummyGroupName(g.groupName)) {
        const tid = String(g.groupId);
        const name = g.groupName!.trim();
        map[tid] = name;
        changed = true;
        try {
          window.sessionStorage.setItem(`groupName_${tid}`, name);
        } catch {
          // ignore
        }
      }
    }

    if (changed) {
      window.localStorage.setItem(KNOWN_NAMES_KEY, JSON.stringify(map));
    }
  } catch {
    // ignore
  }
}

/**
 * 로컬에 저장된 차단 그룹 목록 조회 (더미 이름 자동 복구 포함)
 */
export function readBlockedGroups(): BlockedGroupStorageItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    let hasRepairs = false;
    const result: BlockedGroupStorageItem[] = parsed.map((item) => {
      let groupName = item.groupName;
      if (isDummyGroupName(groupName)) {
        const resolved = getKnownGroupName(item.groupId);
        if (resolved && !isDummyGroupName(resolved)) {
          groupName = resolved;
          hasRepairs = true;
        }
      } else {
        saveKnownGroupName(item.groupId, groupName);
      }

      return {
        ...item,
        groupName: isDummyGroupName(groupName)
          ? groupName || "그룹"
          : groupName,
        reason: isDummyReason(item.reason) ? undefined : item.reason?.trim(),
      };
    });

    if (hasRepairs) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    }

    return result;
  } catch {
    return [];
  }
}

/**
 * 로컬 스토리지에 남아있는 더미 그룹명을 제공된 그룹 목록이나 캐시로 복원(Self-healing)
 */
export function repairBlockedGroupNames(
  knownGroups?: Array<{ groupId: string | number; groupName?: string | null }>,
): BlockedGroupStorageItem[] {
  if (typeof window === "undefined") return [];
  if (knownGroups && knownGroups.length > 0) {
    saveKnownGroupNames(knownGroups);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    let hasChanges = false;
    const repaired = parsed.map((item) => {
      const cleanReason = isDummyReason(item.reason)
        ? undefined
        : item.reason?.trim();
      let currentName = item.groupName;

      const knownItem = knownGroups?.find(
        (kg) =>
          String(kg.groupId) === String(item.groupId) &&
          !isDummyGroupName(kg.groupName),
      );

      if (knownItem?.groupName) {
        const targetName = knownItem.groupName.trim();
        if (currentName !== targetName) {
          currentName = targetName;
          hasChanges = true;
        }
      } else if (isDummyGroupName(currentName)) {
        const realName = getKnownGroupName(item.groupId);
        if (realName && !isDummyGroupName(realName)) {
          currentName = realName;
          hasChanges = true;
        }
      }

      return {
        ...item,
        groupName: currentName || "그룹",
        reason: cleanReason,
      };
    });

    if (hasChanges) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(repaired));
    }
    return repaired;
  } catch {
    return [];
  }
}

/**
 * 알려진 모든 그룹 ID 목록 조회
 */
export function getKnownGroupIds(): string[] {
  if (typeof window === "undefined") return [];
  const ids = new Set<string>();

  // 1. localStorage의 KNOWN_NAMES_KEY
  try {
    const raw = window.localStorage.getItem(KNOWN_NAMES_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map && typeof map === "object") {
        for (const k of Object.keys(map)) {
          if (k && k.trim()) ids.add(k.trim());
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. sessionStorage의 groupName_ 및 pendingGroupId
  try {
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (!key) continue;
      if (key.startsWith("groupName_")) {
        const id = key.slice("groupName_".length).trim();
        if (id) ids.add(id);
      }
    }
    const pendingId = window.sessionStorage.getItem("pendingGroupId");
    if (pendingId && pendingId.trim()) ids.add(pendingId.trim());
  } catch {
    // ignore
  }

  return Array.from(ids);
}

/**
 * 로컬 스토리지에 저장된 모든 블랙리스트 그룹 ID 목록 조회
 */
export function getBlacklistedGroupIds(): string[] {
  if (typeof window === "undefined") return [];
  const ids = new Set<string>();

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (key.startsWith("mixmate:group-blacklist:")) {
        const id = key.slice("mixmate:group-blacklist:".length).trim();
        if (id) ids.add(id);
      } else if (key.startsWith("mixmate_blacklist_")) {
        const id = key.slice("mixmate_blacklist_".length).trim();
        if (id) ids.add(id);
      }
    }
  } catch {
    // ignore
  }

  return Array.from(ids);
}

/**
 * 특정 그룹명을 알려진 그룹명 캐시에서 제거
 */
export function removeKnownGroupName(groupId: string | number): void {
  if (typeof window === "undefined" || !groupId) return;
  const targetId = String(groupId);

  try {
    const raw = window.localStorage.getItem(KNOWN_NAMES_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map && typeof map === "object" && map[targetId]) {
        delete map[targetId];
        window.localStorage.setItem(KNOWN_NAMES_KEY, JSON.stringify(map));
      }
    }
  } catch {
    // ignore
  }

  try {
    window.sessionStorage.removeItem(`groupName_${targetId}`);
  } catch {
    // ignore
  }
}

/**
 * 사용자가 직접 삭제한 차단 그룹 ID를 무시 목록에 추가 (자동 복구 시 재부활 방지)
 * (홈 화면의 차단 안내 모달에서 '목록에서 삭제하기' 버튼을 명시적으로 클릭했을 때만 호출)
 */
export function dismissBlockedGroup(groupId: string | number): void {
  console.trace("[CRITICAL BUG TRACE] dismissBlockedGroup called for groupId:", groupId);
  if (typeof window === "undefined" || !groupId) return;
  const targetId = String(groupId).trim();

  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    const list: unknown[] = raw ? JSON.parse(raw) : [];
    if (!list.some((id) => String(id).trim() === targetId)) {
      list.push(targetId);
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
      if (typeof console !== "undefined" && console.log) {
        console.log("[DEBUG] dismissBlockedGroup updated DISMISSED_KEY:", list);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * 특정 그룹이 무시 목록에 등록되어 있는지 확인
 */
export function isDismissedBlockedGroup(groupId: string | number): boolean {
  if (typeof window === "undefined" || !groupId) return false;
  const targetId = String(groupId).trim();

  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const list: unknown = JSON.parse(raw);
    return (
      Array.isArray(list) &&
      list.some((id) => String(id).trim() === targetId)
    );
  } catch {
    return false;
  }
}

/**
 * 차단이 새로 발생했거나 홈 이동 시 무시 목록에서 제거
 */
export function undismissBlockedGroup(groupId: string | number): void {
  if (typeof window === "undefined" || !groupId) return;
  const targetId = String(groupId).trim();
  if (typeof console !== "undefined" && console.log) {
    console.log("[DEBUG] undismissBlockedGroup called for groupId:", targetId);
  }

  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return;
    const list: unknown = JSON.parse(raw);
    if (Array.isArray(list)) {
      const updated = list.filter(
        (id) => String(id).trim() !== targetId,
      );
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      if (typeof console !== "undefined" && console.log) {
        console.log("[DEBUG] undismissBlockedGroup updated DISMISSED_KEY:", updated);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * 차단된 그룹 정보를 로컬에 기록 (홈 화면 유지용)
 */
export function recordBlockedGroup(item: BlockedGroupStorageItem): void {
  console.log("[DEBUG] recordBlockedGroup called with:", item);
  if (typeof window === "undefined" || !item.groupId) return;
  try {
    undismissBlockedGroup(item.groupId);

    const list = readBlockedGroups();
    const existingIndex = list.findIndex(
      (g) => String(g.groupId).trim() === String(item.groupId).trim(),
    );
    const existing = existingIndex >= 0 ? list[existingIndex] : undefined;

    const cleanReason = isDummyReason(item.reason)
      ? undefined
      : item.reason?.trim();

    const incomingGroupName = item.groupName?.trim();
    let finalGroupName: string;

    if (!isDummyGroupName(incomingGroupName)) {
      finalGroupName = incomingGroupName!;
      saveKnownGroupName(item.groupId, finalGroupName);
    } else if (existing && !isDummyGroupName(existing.groupName)) {
      finalGroupName = existing.groupName;
    } else {
      const resolved = getKnownGroupName(item.groupId);
      if (resolved && !isDummyGroupName(resolved)) {
        finalGroupName = resolved;
      } else {
        finalGroupName =
          incomingGroupName && incomingGroupName !== "그룹"
            ? incomingGroupName
            : "그룹";
      }
    }

    const newItem: BlockedGroupStorageItem = {
      groupId: String(item.groupId).trim(),
      groupName: finalGroupName,
      reason: cleanReason,
      blockedAt: item.blockedAt || new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = {
        ...existing,
        ...newItem,
        groupName: finalGroupName,
        reason: cleanReason || existing?.reason,
        blockedAt: newItem.blockedAt || existing?.blockedAt,
      };
    } else {
      list.push(newItem);
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (typeof console !== "undefined" && console.log) {
      console.log("[DEBUG] recordBlockedGroup updated STORAGE_KEY:", list);
    }
  } catch (err) {
    if (typeof console !== "undefined" && console.error) {
      console.error("[DEBUG] recordBlockedGroup error:", err);
    }
  }
}

/**
 * 사용자가 홈 화면에서 삭제 시 로컬 기록에서 제거
 */
export function removeBlockedGroup(groupId: string | number): void {
  if (typeof window === "undefined" || !groupId) return;
  const targetId = String(groupId).trim();
  try {
    const list = readBlockedGroups().filter(
      (g) => String(g.groupId).trim() !== targetId,
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
    window.localStorage.removeItem(KNOWN_NAMES_KEY);
    window.localStorage.removeItem(DISMISSED_KEY);
  } catch {
    // ignore
  }
}
