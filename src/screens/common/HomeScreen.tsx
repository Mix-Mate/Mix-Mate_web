"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Ban, LogOut, ChevronRight } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { getMyGroupsApi, type MyGroupItem } from "@/features/group/api/group.api";
import {
  getGroupEntryRoute,
  isGroupHost,
} from "@/features/group/lib/group-entry-route";
import { checkUserBlockedInGroup } from "@/features/blacklist/api/blacklist.api";
import { performLogout } from "@/features/auth/api/auth.api";
import styles from "./HomeScreen.module.css";

export type GroupRole = "HOST" | "PARTICIPANT";

export type GroupStatus =
  | "RECRUITING"
  | "FIRST_ROUND"
  | "VOTING"
  | "SECOND_ROUND"
  | "FINISHED";

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

  // Group lists state
  const [activeGroups, setActiveGroups] =
    useState<HomeScreenGroupItem[]>(initialActiveGroups);
  const [completedGroups, setCompletedGroups] =
    useState<HomeScreenGroupItem[]>(initialCompletedGroups);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const [blockedModalInfo, setBlockedModalInfo] = useState<{
    groupName: string;
    reason: string;
    blockedAt?: string;
  } | null>(null);

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

  const handleGroupClick = async (group: HomeScreenGroupItem) => {
    // 관리자가 아닌 경우 차단 여부 먼저 확인
    if (group.role !== "HOST") {
      const blocked = await checkUserBlockedInGroup(group.id, {
        name: userName,
      });

      if (blocked) {
        setBlockedModalInfo({
          groupName: group.name,
          reason: blocked.reason || "관리자에 의해 그룹에서 차단되었습니다.",
          blockedAt: blocked.blockedAt,
        });
        setIsBlockedModalOpen(true);
        return;
      }
    }

    if (group.status === "FINISHED") {
      router.push(groupRoutes.completed(group.id));
      return;
    }
    router.push(getGroupEntryRoute(group.id, group.role, group.status));
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
      {/* 1. 상단 헤더 */}
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
          <div className={styles.tabBar} role="tablist" aria-label="모임 구분 탭">
            <button
              type="button"
              role="tab"
              id="tab-active"
              aria-selected={activeTab === "ACTIVE"}
              aria-controls="tabpanel-active"
              className={`${styles.tabButton} ${
                activeTab === "ACTIVE" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("ACTIVE")}
            >
              진행 중인 모임
            </button>

            <button
              type="button"
              role="tab"
              id="tab-completed"
              aria-selected={activeTab === "COMPLETED"}
              aria-controls="tabpanel-completed"
              className={`${styles.tabButton} ${
                activeTab === "COMPLETED" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("COMPLETED")}
            >
              완료된 모임
            </button>
          </div>

          {/* 탭 콘텐츠 리스트 영역 */}
          <div
            id={activeTab === "ACTIVE" ? "tabpanel-active" : "tabpanel-completed"}
            role="tabpanel"
            aria-labelledby={activeTab === "ACTIVE" ? "tab-active" : "tab-completed"}
            className={styles.tabContent}
          >
            {activeTab === "ACTIVE" ? (
              isLoading ? (
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
                  <article
                    key={group.id}
                    className={styles.completedCard}
                  >
                    <div className={styles.completedCardLeft}>
                      <h4 className={styles.completedGroupName}>{group.name}</h4>
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

      {/* 4. 로그아웃 확인 바텀시트 모달 */}
      <BottomSheetDialog
        open={isLogoutModalOpen}
        titleId="logout-modal-title"
        descriptionId="logout-modal-description"
        scrimClassName={styles.modalScrim}
        sheetClassName={styles.modalSheet}
        onClose={() => setIsLogoutModalOpen(false)}
      >
        <div className={`${styles.modalIcon} ${styles.modalIconDanger}`}>
          <LogOut size={24} strokeWidth={2} aria-hidden="true" />
        </div>

        <div className={styles.modalContent}>
          <h3 id="logout-modal-title" className={styles.modalTitle}>
            로그아웃할까요?
          </h3>
          <p id="logout-modal-description" className={styles.modalDescription}>
            언제든지 다시 로그인하여 서비스를 이용하실 수 있습니다.
          </p>
        </div>

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
      </BottomSheetDialog>

      {/* 5. 그룹 차단(추방) 알림 팝업 모달 */}
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
            그룹에서 차단되었습니다
          </h3>
          <p
            id="blocked-alert-modal-description"
            className={styles.modalDescription}
          >
            <strong>{blockedModalInfo?.groupName}</strong> 그룹 관리자에 의해
            <br />
            그룹 이용이 차단(추방)되었습니다.
          </p>

          <div className={styles.blockedReasonBox}>
            <span className={styles.blockedReasonLabel}>차단 사유</span>
            <p className={styles.blockedReasonText}>
              {blockedModalInfo?.reason || "등록된 차단 사유가 없습니다."}
            </p>
          </div>
        </div>

        <div className={styles.modalSingleAction}>
          <button
            type="button"
            className={styles.modalSingleActionButton}
            onClick={() => setIsBlockedModalOpen(false)}
          >
            확인
          </button>
        </div>
      </BottomSheetDialog>
    </MobileFrame>
  );
}
