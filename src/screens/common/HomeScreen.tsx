"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronRight } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { getMyGroupsApi, type MyGroupItem } from "@/features/group/api/group.api";
import { performLogout } from "@/features/auth/api/auth.api";
import styles from "./HomeScreen.module.css";

export type GroupRole = "HOST" | "PARTICIPANT";

export type GroupStatus =
  | "RECRUITING"
  | "FIRST_ROUND"
  | "VOTING"
  | "SECOND_ROUND"
  | "FINISHED";

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
}

const DEFAULT_ACTIVE_GROUPS: HomeScreenGroupItem[] = [];
const DEFAULT_COMPLETED_GROUPS: HomeScreenGroupItem[] = [];

const STATUS_CONFIG: Record<
  GroupStatus,
  { label: string; className: string }
> = {
  RECRUITING: { label: "모집 중", className: styles.statusRecruiting },
  FIRST_ROUND: { label: "1차 진행 중", className: styles.statusInProgress },
  VOTING: { label: "투표 진행 중", className: styles.statusVoting },
  SECOND_ROUND: { label: "2차 진행 중", className: styles.statusInProgress },
  FINISHED: { label: "종료됨", className: styles.statusCompleted },
};

function mapStatus(status: string): GroupStatus {
  const upper = (status || "").toUpperCase();
  if (upper === "RECRUITING" || upper === "모집 중") return "RECRUITING";
  if (upper === "PROGRESS" || upper === "FIRST_ROUND" || upper === "1차 진행 중")
    return "FIRST_ROUND";
  if (upper === "VOTING" || upper === "투표 진행 중") return "VOTING";
  if (upper === "SECOND_ROUND" || upper === "2차 진행 중") return "SECOND_ROUND";
  if (upper === "FINISHED" || upper === "종료됨") return "FINISHED";
  return "RECRUITING";
}

function mapRole(role: string): GroupRole {
  const upper = (role || "").toUpperCase();
  if (upper === "HOST" || upper === "ADMIN" || upper === "STAFF" || upper === "관리자") {
    return "HOST";
  }
  return "PARTICIPANT";
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
}

export default function HomeScreen({
  userName: propUserName,
  initialActiveGroups = DEFAULT_ACTIVE_GROUPS,
  initialCompletedGroups = DEFAULT_COMPLETED_GROUPS,
}: HomeScreenProps) {
  const router = useRouter();

  // Dynamic logged in user name resolution using useSyncExternalStore (SSR & Hydration safe)
  const storedUserName = useSyncExternalStore(
    subscribeStorage,
    getStoredUserName,
    getServerUserNameSnapshot,
  );
  const userName = propUserName || storedUserName;

  // Group lists state
  const [activeGroups, setActiveGroups] =
    useState<HomeScreenGroupItem[]>(initialActiveGroups);
  const [completedGroups, setCompletedGroups] =
    useState<HomeScreenGroupItem[]>(initialCompletedGroups);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Fetch groups on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchMyGroups() {
      setIsLoading(true);
      try {
        const [activeRes, finishedRes] = await Promise.allSettled([
          getMyGroupsApi({ scope: "me", state: "active" }),
          getMyGroupsApi({ scope: "me", state: "finished" }),
        ]);

        if (!isMounted) return;

        if (activeRes.status === "fulfilled" && activeRes.value?.groups) {
          const mapped: HomeScreenGroupItem[] = activeRes.value.groups.map(
            (g: MyGroupItem) => ({
              id: String(g.groupId),
              name: g.groupName,
              status: mapStatus(g.status),
              role: mapRole(g.role),
              memberCount: g.memberCount || 0,
              date: g.date || "진행 중",
              time: g.time,
              location: g.location,
            }),
          );
          setActiveGroups(mapped);
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
            }),
          );
          setCompletedGroups(mapped);
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
  }, []);

  // Navigation handlers
  const handleGroupClick = (group: HomeScreenGroupItem) => {
    if (group.status === "FINISHED") {
      router.push(groupRoutes.completed(group.id));
    } else {
      router.push(groupRoutes.home(group.id));
    }
  };

  // Logout flow
  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await performLogout();
    router.push("/login");
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="home-screen"
    >
      {/* 1. 상단 헤더: MixMate 제목만 유지 (로고 제거) */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.brandTitle}>MixMate</h1>
        </div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={() => setIsLogoutModalOpen(true)}
          aria-label="로그아웃"
        >
          <LogOut size={15} aria-hidden="true" />
          <span>로그아웃</span>
        </button>
      </header>

      <main className={styles.main}>
        {/* 환영 인사 영역 */}
        <section className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle} suppressHydrationWarning>
            {userName ? `안녕하세요, ${userName}님 👋` : "안녕하세요 👋"}
          </h2>
        </section>

        {/* 2. 액션 섹션: '새 그룹 생성', '초대 코드로 입장' 2개 카드 (2열 그리드) */}
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
                모임을 만들고 참여코드를 발급
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
                참여코드를 입력하여 참여
              </p>
            </div>
          </button>
        </section>

        {/* 섹션 구분선 (참여 중인 모임 위) */}
        <div
          className={styles.sectionDivider}
          role="separator"
          aria-hidden="true"
        />

        {/* 남은 화면 50:50 분할 컨테이너 */}
        <div className={styles.listsContainer}>
          {/* 3. 모임 목록 섹션 1: 내 그룹 목록 */}
          <section className={styles.halfSection} aria-label="내 그룹 목록">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>내 그룹 목록</h3>
            </div>

            {isLoading ? (
              <div className={styles.skeletonList}>
                <div className={styles.skeletonCard} />
                <div className={styles.skeletonCard} />
              </div>
            ) : activeGroups.length > 0 ? (
              <div className={styles.groupList}>
                {activeGroups.map((group) => {
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
                          {statusInfo.label} · {group.memberCount}명
                        </p>

                        <div className={styles.roleTagWrap}>
                          <span
                            className={`${styles.roleTag} ${
                              group.role === "HOST"
                                ? styles.roleTagAdmin
                                : styles.roleTagUser
                            }`}
                          >
                            {group.role === "HOST" ? "관리자" : "사용자"}
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
                <p className={styles.emptyText}>참여 중인 그룹이 없습니다.</p>
              </div>
            )}
          </section>

          {/* 섹션 구분선 */}
          <div
            className={styles.sectionDivider}
            role="separator"
            aria-hidden="true"
          />

          {/* 4. 모임 목록 섹션 2: 완료된 모임 */}
          <section className={styles.halfSection} aria-label="완료된 모임">
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>완료된 모임</h3>
            </div>

            {isLoading ? (
              <div className={styles.skeletonList}>
                <div className={styles.skeletonCardCompleted} />
              </div>
            ) : completedGroups.length > 0 ? (
              <div className={styles.completedList}>
                {completedGroups.map((group) => (
                  <article
                    key={group.id}
                    className={styles.completedCard}
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
                    <div className={styles.completedCardLeft}>
                      <span className={styles.completedGroupName}>
                        {group.name}
                      </span>
                    </div>

                    <div className={styles.completedCardRight}>
                      <ChevronRight size={16} aria-hidden="true" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>완료된 모임이 없습니다.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 5. 로그아웃 확인 바텀시트 모달 */}
      <BottomSheetDialog
        open={isLogoutModalOpen}
        titleId="logout-modal-title"
        scrimClassName={styles.modalScrim}
        sheetClassName={styles.modalSheet}
        onClose={() => setIsLogoutModalOpen(false)}
      >
        <div className={styles.modalBody}>
          <p id="logout-modal-title" className={styles.modalDescription}>
            로그아웃 하시겠습니까?
          </p>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalCancelButton}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              취소
            </button>

            <button
              type="button"
              className={`${styles.modalConfirmButton} ${styles.modalDangerButton}`}
              onClick={handleConfirmLogout}
            >
              로그아웃
            </button>
          </div>
        </div>
      </BottomSheetDialog>
    </MobileFrame>
  );
}
