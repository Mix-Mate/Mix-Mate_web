"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Ban, User, ChevronRight } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import { authRoutes, groupRoutes } from "@/shared/lib/navigation/routes";
import {
  getMyGroupsApi,
  GroupApiError,
  type MyGroupItem,
} from "@/features/group/api/group.api";
import { isGroupHost } from "@/features/group/lib/group-entry-route";
import type { GroupStatus as ApiGroupStatus } from "@/features/group/types/group.types";
import { checkUserBlockedInGroup } from "@/features/blacklist/api/blacklist.api";
import {
  recordBlockedGroup,
  removeBlockedGroup,
  getKnownGroupName,
  saveKnownGroupNames,
  repairBlockedGroupNames,
  isDummyGroupName,
  getKnownGroupIds,
  getBlacklistedGroupIds,
  dismissBlockedGroup,
  isDismissedBlockedGroup,
  removeKnownGroupName,
  type BlockedGroupStorageItem,
} from "@/features/blacklist/lib/blockedGroupsStorage";
import {
  clearAuthTokens,
  getAccessToken,
  isTokenExpired,
} from "@/shared/api/authToken";
import styles from "./HomeScreen.module.css";

export type GroupRole = "HOST" | "PARTICIPANT";

export type GroupStatus = ApiGroupStatus;

export type HomeTab = "ACTIVE" | "COMPLETED";

export interface HomeScreenGroupItem {
  id: string;
  name: string;
  description?: string;
  status: GroupStatus;
  role: GroupRole;
  memberCount: number;
  date: string;
  time?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  finishedAt?: string;
  closedAt?: string;
  isBlocked?: boolean;
  blockReason?: string;
}

const DEFAULT_ACTIVE_GROUPS: HomeScreenGroupItem[] = [];
const DEFAULT_COMPLETED_GROUPS: HomeScreenGroupItem[] = [];

const STATUS_CONFIG: Record<GroupStatus, { label: string; className: string }> =
  {
    RECRUITING: { label: "모집 중", className: styles.statusRecruiting },
    BEFORE_FIRST_ROUND: {
      label: "1차 준비 중",
      className: styles.statusInProgress,
    },
    FIRST_ROUND: { label: "1차 진행 중", className: styles.statusInProgress },
    VOTING: { label: "투표 진행 중", className: styles.statusVoting },
    VOTE_CLOSED: { label: "투표 종료", className: styles.statusVoting },
    BEFORE_SECOND_ROUND: {
      label: "2차 준비 중",
      className: styles.statusInProgress,
    },
    SECOND_ROUND: { label: "2차 진행 중", className: styles.statusInProgress },
    FINISHED: { label: "종료됨", className: styles.statusCompleted },
  };

function parseDateTimestamp(dateStr?: string, timeStr?: string): number {
  if (!dateStr) return 0;
  const directParsed = Date.parse(dateStr);
  if (!Number.isNaN(directParsed)) {
    return directParsed;
  }
  const cleaned = dateStr.replace(/\./g, "-").trim();
  const fullStr = timeStr ? `${cleaned} ${timeStr.trim()}` : cleaned;
  const parsed = Date.parse(fullStr);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * 진행 중인 모임 정렬: 가장 최근에 업데이트/생성된 순 (내림차순)
 * 우선순위: updatedAt > createdAt > date/time > id(내림차순)
 */
export function sortActiveGroups(
  groups: HomeScreenGroupItem[],
): HomeScreenGroupItem[] {
  return [...groups].sort((a, b) => {
    const timeA =
      parseDateTimestamp(a.updatedAt) ||
      parseDateTimestamp(a.createdAt) ||
      parseDateTimestamp(a.date, a.time);
    const timeB =
      parseDateTimestamp(b.updatedAt) ||
      parseDateTimestamp(b.createdAt) ||
      parseDateTimestamp(b.date, b.time);

    if (timeA !== timeB) {
      return timeB - timeA;
    }

    const idA = Number(a.id);
    const idB = Number(b.id);
    if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
      return idB - idA;
    }

    return b.id.localeCompare(a.id);
  });
}

/**
 * 완료된 모임 정렬: 가장 최근에 완료/종료된 순 (내림차순)
 * 우선순위: finishedAt > closedAt > updatedAt > date/time > createdAt > id(내림차순)
 */
export function sortCompletedGroups(
  groups: HomeScreenGroupItem[],
): HomeScreenGroupItem[] {
  return [...groups].sort((a, b) => {
    const timeA =
      parseDateTimestamp(a.finishedAt) ||
      parseDateTimestamp(a.closedAt) ||
      parseDateTimestamp(a.updatedAt) ||
      parseDateTimestamp(a.date, a.time) ||
      parseDateTimestamp(a.createdAt);
    const timeB =
      parseDateTimestamp(b.finishedAt) ||
      parseDateTimestamp(b.closedAt) ||
      parseDateTimestamp(b.updatedAt) ||
      parseDateTimestamp(b.date, b.time) ||
      parseDateTimestamp(b.createdAt);

    if (timeA !== timeB) {
      return timeB - timeA;
    }

    const idA = Number(a.id);
    const idB = Number(b.id);
    if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
      return idB - idA;
    }

    return b.id.localeCompare(a.id);
  });
}

function mapStatus(status: string): GroupStatus {
  const upper = (status || "").toUpperCase();
  if (upper === "RECRUITING" || upper === "모집 중") return "RECRUITING";
  if (upper === "BEFORE_FIRST_ROUND" || upper === "1차 준비 중")
    return "BEFORE_FIRST_ROUND";
  if (
    upper === "PROGRESS" ||
    upper === "FIRST_ROUND" ||
    upper === "1차 진행 중"
  )
    return "FIRST_ROUND";
  if (upper === "VOTING" || upper === "투표 진행 중") return "VOTING";
  if (upper === "VOTE_CLOSED" || upper === "투표 종료") return "VOTE_CLOSED";
  if (upper === "BEFORE_SECOND_ROUND" || upper === "2차 준비 중")
    return "BEFORE_SECOND_ROUND";
  if (upper === "SECOND_ROUND" || upper === "2차 진행 중")
    return "SECOND_ROUND";
  if (upper === "FINISHED" || upper === "종료됨") return "FINISHED";
  // 알 수 없는 활성 상태를 모집 중으로 간주하면 모집 화면이 잘못 노출된다.
  return "FIRST_ROUND";
}

function mapRole(role: string): GroupRole {
  return isGroupHost(role) ? "HOST" : "PARTICIPANT";
}

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredUserName(): string {
  if (typeof window === "undefined") return "사용자";
  const directName =
    window.localStorage.getItem("userName") ||
    window.localStorage.getItem("displayName") ||
    window.localStorage.getItem("name");
  if (directName) return directName;

  const userStr = window.localStorage.getItem("user");
  if (userStr) {
    try {
      const parsed = JSON.parse(userStr) as {
        userName?: string;
        displayName?: string;
        name?: string;
      };
      return parsed.userName || parsed.displayName || parsed.name || "사용자";
    } catch {
      return userStr;
    }
  }
  return "사용자";
}

function getServerUserNameSnapshot(): string {
  return "사용자";
}

interface HomeScreenProps {
  userName?: string;
  initialActiveGroups?: HomeScreenGroupItem[];
  initialCompletedGroups?: HomeScreenGroupItem[];
  initialTab?: HomeTab;
}

export default function HomeScreen({
  userName: propUserName,
  initialActiveGroups = DEFAULT_ACTIVE_GROUPS,
  initialCompletedGroups = DEFAULT_COMPLETED_GROUPS,
  initialTab = "ACTIVE",
}: HomeScreenProps) {
  const router = useRouter();

  // Dynamic logged in user name resolution using useSyncExternalStore (SSR & Hydration safe)
  const storedUserName = useSyncExternalStore(
    subscribeStorage,
    getStoredUserName,
    getServerUserNameSnapshot,
  );
  const userName = propUserName || storedUserName;

  // Tab state
  const [activeTab, setActiveTab] = useState<HomeTab>(initialTab);

  // Group lists state with initial sorting applied
  const [activeGroups, setActiveGroups] = useState<HomeScreenGroupItem[]>(() =>
    sortActiveGroups(initialActiveGroups),
  );
  const [completedGroups, setCompletedGroups] = useState<HomeScreenGroupItem[]>(
    () => sortCompletedGroups(initialCompletedGroups),
  );
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [blockedModalInfo, setBlockedModalInfo] = useState<{
    groupId: string;
    groupName: string;
    reason?: string;
    blockedAt?: string;
  } | null>(null);

  // Fetch groups on mount & verify auth token
  useEffect(() => {
    let isMounted = true;

    // 1. 토큰 만료 여부 확인: 토큰이 없거나 만료된 경우 로그인 화면으로 이동
    const token = getAccessToken();
    if (!token || isTokenExpired(token)) {
      clearAuthTokens();
      router.replace(authRoutes.login());
      return;
    }

    async function fetchMyGroups() {
      setIsLoading(true);
      try {
        const [activeRes, finishedRes] = await Promise.allSettled([
          getMyGroupsApi({ scope: "me", state: "active" }),
          getMyGroupsApi({ scope: "me", state: "finished" }),
        ]);

        if (!isMounted) return;

        // 401 인증 만료/오류 여부 검사
        const isUnauthorized = (res: PromiseSettledResult<unknown>) => {
          if (res.status === "rejected") {
            const err = res.reason;
            if (err instanceof GroupApiError && err.status === 401) {
              return true;
            }
            if (
              err?.status === 401 ||
              (typeof err?.message === "string" &&
                err.message.includes("토큰이 없거나 만료"))
            ) {
              return true;
            }
          }
          return false;
        };

        if (isUnauthorized(activeRes) || isUnauthorized(finishedRes)) {
          clearAuthTokens();
          router.replace(authRoutes.login());
          return;
        }

        const allApiGroups: MyGroupItem[] = [];
        if (activeRes.status === "fulfilled" && activeRes.value?.groups) {
          allApiGroups.push(...activeRes.value.groups);
        }
        if (finishedRes.status === "fulfilled" && finishedRes.value?.groups) {
          allApiGroups.push(...finishedRes.value.groups);
        }
        if (allApiGroups.length > 0) {
          saveKnownGroupNames(allApiGroups);
        }

        const localBlockedList = repairBlockedGroupNames(allApiGroups).filter(
          (b) => !isDismissedBlockedGroup(b.groupId),
        );

        // 알려진 그룹 또는 로컬 블랙리스트에 있지만 서버 응답 및 로컬 차단 목록에 없고 dismiss되지 않은 그룹 탐색
        const candidateIds = Array.from(
          new Set([...getKnownGroupIds(), ...getBlacklistedGroupIds()]),
        ).filter(
          (cid) =>
            !isDismissedBlockedGroup(cid) &&
            !allApiGroups.some((g) => String(g.groupId).trim() === String(cid).trim()) &&
            !localBlockedList.some((b) => String(b.groupId).trim() === String(cid).trim()),
        );

        if (candidateIds.length > 0) {
          const checked = await Promise.allSettled(
            candidateIds.map(async (cid) => {
              if (isDismissedBlockedGroup(cid)) return null;
              const blocked = await checkUserBlockedInGroup(cid, {
                name: userName,
              });
              if (blocked && !isDismissedBlockedGroup(cid)) {
                const realName =
                  getKnownGroupName(cid) ||
                  (blocked.name && !isDummyGroupName(blocked.name)
                    ? blocked.name
                    : undefined) ||
                  "그룹";
                const item: BlockedGroupStorageItem = {
                  groupId: String(cid).trim(),
                  groupName: realName,
                  reason: blocked.reason,
                  blockedAt: blocked.blockedAt,
                };
                recordBlockedGroup(item);
                return item;
              }
              return null;
            }),
          );

          for (const res of checked) {
            if (res.status === "fulfilled" && res.value) {
              const item = res.value;
              if (
                !isDismissedBlockedGroup(item.groupId) &&
                !localBlockedList.some(
                  (b) => String(b.groupId).trim() === String(item.groupId).trim(),
                )
              ) {
                localBlockedList.push(item);
              }
            }
          }
        }

        const resolveBlockedGroupName = (
          blocked: BlockedGroupStorageItem,
        ): string => {
          if (!isDummyGroupName(blocked.groupName)) {
            return blocked.groupName;
          }
          const foundInApi = allApiGroups.find(
            (g) => String(g.groupId) === String(blocked.groupId),
          );
          if (foundInApi && !isDummyGroupName(foundInApi.groupName)) {
            return foundInApi.groupName;
          }
          const foundInInitial =
            initialActiveGroups.find(
              (g) => String(g.id) === String(blocked.groupId),
            ) ||
            initialCompletedGroups.find(
              (g) => String(g.id) === String(blocked.groupId),
            );
          if (foundInInitial && !isDummyGroupName(foundInInitial.name)) {
            return foundInInitial.name;
          }
          const fromCache = getKnownGroupName(blocked.groupId);
          if (fromCache && !isDummyGroupName(fromCache)) {
            return fromCache;
          }
          return blocked.groupName || "그룹";
        };

        if (activeRes.status === "fulfilled" && activeRes.value?.groups) {
          const mapped: HomeScreenGroupItem[] = activeRes.value.groups.map(
            (g: MyGroupItem) => {
              const isDismissed = isDismissedBlockedGroup(g.groupId);
              const localBlocked = !isDismissed
                ? localBlockedList.find(
                    (b) => String(b.groupId).trim() === String(g.groupId).trim(),
                  )
                : undefined;
              if (localBlocked && isDummyGroupName(localBlocked.groupName)) {
                recordBlockedGroup({
                  ...localBlocked,
                  groupName: g.groupName,
                });
              }
              return {
                id: String(g.groupId),
                name: g.groupName,
                status: mapStatus(g.status),
                role: mapRole(g.role),
                memberCount: g.memberCount || 0,
                date: g.date || "진행 중",
                time: g.time,
                location: g.location,
                createdAt: g.createdAt,
                updatedAt: g.updatedAt,
                finishedAt: g.finishedAt,
                closedAt: g.closedAt,
                isBlocked: Boolean(localBlocked),
                blockReason: localBlocked?.reason,
              };
            },
          );

          // 로컬에 저장된 차단 그룹 중 서버 활성 응답에 없는 그룹 병합 (최초 1회 유지)
          for (const blocked of localBlockedList) {
            if (
              !isDismissedBlockedGroup(blocked.groupId) &&
              !mapped.some((item) => String(item.id).trim() === String(blocked.groupId).trim())
            ) {
              const resolvedName = resolveBlockedGroupName(blocked);
              if (
                isDummyGroupName(blocked.groupName) &&
                !isDummyGroupName(resolvedName)
              ) {
                recordBlockedGroup({
                  ...blocked,
                  groupName: resolvedName,
                });
              }
              mapped.push({
                id: String(blocked.groupId).trim(),
                name: resolvedName,
                status: "BEFORE_FIRST_ROUND",
                role: "PARTICIPANT",
                memberCount: 0,
                date: "차단됨",
                createdAt: blocked.blockedAt,
                isBlocked: true,
                blockReason: blocked.reason,
              });
            }
          }

          const visibleActiveGroups = mapped.filter(
            (item) => !item.isBlocked || !isDismissedBlockedGroup(item.id),
          );
          setActiveGroups(sortActiveGroups(visibleActiveGroups));
        } else if (localBlockedList.length > 0) {
          const visibleBlockedList = localBlockedList.filter(
            (blocked) => !isDismissedBlockedGroup(blocked.groupId),
          );
          const mapped: HomeScreenGroupItem[] = visibleBlockedList.map(
            (blocked) => {
              const resolvedName = resolveBlockedGroupName(blocked);
              if (
                isDummyGroupName(blocked.groupName) &&
                !isDummyGroupName(resolvedName)
              ) {
                recordBlockedGroup({
                  ...blocked,
                  groupName: resolvedName,
                });
              }
              return {
                id: String(blocked.groupId).trim(),
                name: resolvedName,
                status: "BEFORE_FIRST_ROUND",
                role: "PARTICIPANT",
                memberCount: 0,
                date: "차단됨",
                createdAt: blocked.blockedAt,
                isBlocked: true,
                blockReason: blocked.reason,
              };
            },
          );
          setActiveGroups(sortActiveGroups(mapped));
        }

        if (finishedRes.status === "fulfilled" && finishedRes.value?.groups) {
          const mapped: HomeScreenGroupItem[] = finishedRes.value.groups.map(
            (g: MyGroupItem) => ({
              id: String(g.groupId),
              name: g.groupName,
              status: "FINISHED",
              role: mapRole(g.role),
              memberCount: g.memberCount || 0,
              date: g.date || "종료",
              time: g.time,
              location: g.location,
              createdAt: g.createdAt,
              updatedAt: g.updatedAt,
              finishedAt: g.finishedAt,
              closedAt: g.closedAt,
            }),
          );
          setCompletedGroups(sortCompletedGroups(mapped));
        }
      } catch (error) {
        console.error("내 그룹 목록 조회 실패:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchMyGroups();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleGroupClick = async (group: HomeScreenGroupItem) => {
    if (group.isBlocked) {
      let currentReason = group.blockReason;
      if (!currentReason && group.role !== "HOST") {
        const blocked = await checkUserBlockedInGroup(group.id, {
          name: userName,
        });
        if (blocked?.reason) {
          currentReason = blocked.reason;
          recordBlockedGroup({
            groupId: group.id,
            groupName: group.name,
            reason: blocked.reason,
            blockedAt: blocked.blockedAt,
          });
        }
      }

      setBlockedModalInfo({
        groupId: group.id,
        groupName: group.name,
        reason: currentReason,
        blockedAt: group.createdAt,
      });
      setIsBlockedModalOpen(true);
      return;
    }

    // 관리자가 아닌 경우 차단 여부 먼저 확인
    if (group.role !== "HOST") {
      const blocked = await checkUserBlockedInGroup(group.id, {
        name: userName,
      });

      if (blocked) {
        recordBlockedGroup({
          groupId: group.id,
          groupName: group.name,
          reason: blocked.reason,
          blockedAt: blocked.blockedAt,
        });
        setBlockedModalInfo({
          groupId: group.id,
          groupName: group.name,
          reason: blocked.reason,
          blockedAt: blocked.blockedAt,
        });
        setIsBlockedModalOpen(true);
        return;
      }
    }

    if (group.status === "FINISHED") {
      return;
    }
    router.push(groupRoutes.home(group.id));
  };

  const handleRemoveBlockedGroup = () => {
    if (!blockedModalInfo) return;
    const targetGroupId = String(blockedModalInfo.groupId).trim();
    dismissBlockedGroup(targetGroupId);
    removeKnownGroupName(targetGroupId);
    removeBlockedGroup(targetGroupId);
    setActiveGroups((prev) =>
      prev.filter((item) => String(item.id).trim() !== targetGroupId),
    );
    setIsBlockedModalOpen(false);
    setBlockedModalInfo(null);
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="home-screen"
    >
      {/* 1. 상단 헤더 */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>MixMate</h1>
        </div>

        <button
          type="button"
          className={styles.myPageButton}
          onClick={() => router.push(authRoutes.myPage())}
          aria-label="마이페이지"
        >
          <User size={15} strokeWidth={2} aria-hidden="true" />
          <span>마이페이지</span>
        </button>
      </header>

      <main className={styles.main}>
        {/* 환영 인사 영역 */}
        <section className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle} suppressHydrationWarning>
            {userName ? `안녕하세요, ${userName}님 👋` : "안녕하세요 👋"}
          </h2>
        </section>

        {/* 2. 액션 섹션: '새 그룹 생성', '초대 코드로 입장' 2개 카드 (2열 그리드 고정) */}
        <section
          className={styles.actionsGrid}
          aria-label="모임 생성 및 참여 액션"
        >
          <button
            type="button"
            className={`${styles.actionCard} ${styles.actionCardCreate}`}
            onClick={() => router.push(groupRoutes.create())}
          >
            <span className={styles.actionRoleAdmin}>관리자</span>
            <div className={styles.actionTextGroup}>
              <h3 className={styles.actionCardTitle}>새 그룹 생성</h3>
              <p className={styles.actionCardDesc}>
                모임을 만들고
                <br />
                참여코드를 발급
              </p>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.actionCard} ${styles.actionCardJoin}`}
            onClick={() => router.push(groupRoutes.join())}
          >
            <span className={styles.actionRoleUser}>일반 사용자</span>
            <div className={styles.actionTextGroup}>
              <h3 className={styles.actionCardTitle}>초대 코드로 입장</h3>
              <p className={styles.actionCardDesc}>
                참여코드를 입력하여
                <br />
                모임에 참여
              </p>
            </div>
          </button>
        </section>

        {/* 3. 모임 목록 2단 상단 탭 전환 UI */}
        <section className={styles.tabSection} aria-label="모임 목록">
          {/* 50% 균등 너비 2단 가로 탭 바 */}
          <div
            className={styles.tabBar}
            role="tablist"
            aria-label="모임 구분 탭"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "ACTIVE"}
              className={`${styles.tabButton} ${
                activeTab === "ACTIVE" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("ACTIVE")}
            >
              진행 중인 모임
              {activeTab === "ACTIVE" && (
                <div className={styles.tabIndicator} aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "COMPLETED"}
              className={`${styles.tabButton} ${
                activeTab === "COMPLETED" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("COMPLETED")}
            >
              완료된 모임
              {activeTab === "COMPLETED" && (
                <div className={styles.tabIndicator} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* 4. 탭별 컨텐츠 렌더링 */}
          <div className={styles.tabContent}>
            {activeTab === "ACTIVE" ? (
              isLoading ? (
                <div className={styles.skeletonList}>
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                </div>
              ) : activeGroups.filter(
                  (group) =>
                    !group.isBlocked || !isDismissedBlockedGroup(group.id),
                ).length > 0 ? (
                <div className={styles.groupList}>
                  {activeGroups
                    .filter(
                      (group) =>
                        !group.isBlocked || !isDismissedBlockedGroup(group.id),
                    )
                    .map((group) => {
                    const statusInfo =
                      STATUS_CONFIG[group.status] || STATUS_CONFIG.FIRST_ROUND;

                    return (
                      <article
                        key={group.id}
                        className={styles.groupCard}
                        onClick={() => handleGroupClick(group)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleGroupClick(group);
                          }
                        }}
                      >
                        <div className={styles.groupCardLeft}>
                          <h4 className={styles.groupName}>{group.name}</h4>

                          <p className={styles.groupMetaText}>
                            {group.isBlocked ? "이용 제한" : statusInfo.label} ·{" "}
                            {group.memberCount}명
                          </p>

                          <div className={styles.roleTagWrap}>
                            <span
                              className={`${styles.roleTag} ${
                                group.isBlocked
                                  ? styles.roleTagBlocked
                                  : group.role === "HOST"
                                    ? styles.roleTagAdmin
                                    : styles.roleTagUser
                              }`}
                            >
                              {group.isBlocked
                                ? "차단됨"
                                : group.role === "HOST"
                                  ? "관리자"
                                  : "사용자"}
                            </span>
                          </div>
                        </div>

                        <div className={styles.groupCardRight}>
                          <ChevronRight size={18} aria-hidden="true" />
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>진행 중인 모임이 없습니다.</p>
                </div>
              )
            ) : isLoading ? (
              <div className={styles.skeletonList}>
                <div className={styles.skeletonCardCompleted} />
                <div className={styles.skeletonCardCompleted} />
              </div>
            ) : completedGroups.length > 0 ? (
              <div className={styles.completedList}>
                {completedGroups.map((group) => (
                  <article key={group.id} className={styles.completedCard}>
                    <div className={styles.completedCardLeft}>
                      <h4 className={styles.completedGroupName}>
                        {group.name}
                      </h4>
                      <p className={styles.completedMetaText}>
                        종료됨 · {group.memberCount}명
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>완료된 모임이 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 그룹 이용 제한 안내 모달 */}
      <BottomSheetDialog
        open={isBlockedModalOpen}
        titleId="blocked-alert-modal-title"
        descriptionId="blocked-alert-modal-description"
        scrimClassName={styles.modalScrim}
        sheetClassName={styles.modalSheet}
        onClose={() => setIsBlockedModalOpen(false)}
      >
        <div className={`${styles.modalIcon} ${styles.modalIconDanger}`}>
          <Ban size={24} strokeWidth={2} aria-hidden="true" />
        </div>

        <div className={styles.modalContent}>
          <h3 id="blocked-alert-modal-title" className={styles.modalTitle}>
            그룹 이용 제한 안내
          </h3>
          <p
            id="blocked-alert-modal-description"
            className={styles.modalDescription}
          >
            관리자에 의해 해당 그룹에서 차단되었습니다.
          </p>
        </div>

        <div className={styles.modalSingleAction}>
          <button
            type="button"
            className={`${styles.modalSingleActionButton} ${styles.modalDangerButton}`}
            onClick={handleRemoveBlockedGroup}
          >
            목록에서 삭제하기
          </button>
        </div>
      </BottomSheetDialog>
    </MobileFrame>
  );
}
