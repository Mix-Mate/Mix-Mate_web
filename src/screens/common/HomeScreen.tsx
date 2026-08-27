"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronRight } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
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

  // Dynamic logged in user name resolution
  const [userName] = useState<string>(() => {
    if (propUserName) return propUserName;
    if (typeof window !== "undefined") {
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
    }
    return "사용자";
  });

  // Group lists state
  const [activeGroups] =
    useState<HomeScreenGroupItem[]>(initialActiveGroups);
  const [completedGroups] =
    useState<HomeScreenGroupItem[]>(initialCompletedGroups);

  // Modal states
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Navigation handlers
  const handleGroupClick = (group: HomeScreenGroupItem) => {
    if (group.status === "FINISHED") {
      router.push(groupRoutes.completed(group.id));
    } else {
      router.push(groupRoutes.home(group.id));
    }
  };

  // Logout flow
  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
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
          <h2 className={styles.welcomeTitle}>
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

            {activeGroups.length > 0 ? (
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
                            className={`${styles.roleTag} ${group.role === "HOST"
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

          {/* 4. 모임 목록 섹션 2: 종료된 그룹 목록 (단순 텍스트 / 비활성화 톤) */}
          <section className={styles.halfSection} aria-label="종료된 그룹 목록">
            <div className={styles.sectionHeader}>
              <h3 className={`${styles.sectionTitle} ${styles.sectionTitleCompleted}`}>
                종료된 그룹 목록
              </h3>
            </div>

            {completedGroups.length > 0 ? (
              <div className={styles.completedGroupList}>
                {completedGroups.map((group) => (
                  <div key={group.id} className={styles.completedGroupItem}>
                    <span className={styles.completedGroupName}>
                      {group.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>종료된 그룹이 없습니다.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ==========================================================================
          모달 영역
          ========================================================================== */}

      {/* 로그아웃 확인 모달 */}
      <BottomSheetDialog
        open={isLogoutModalOpen}
        titleId="logout-dialog-title"
        descriptionId="logout-dialog-desc"
        scrimClassName={styles.modalScrim}
        sheetClassName={styles.modalSheet}
        onClose={() => setIsLogoutModalOpen(false)}
      >
        <div
          className={`${styles.modalIcon} ${styles.modalIconDanger}`}
          aria-hidden="true"
        >
          <LogOut size={26} strokeWidth={2} />
        </div>

        <div className={styles.modalContent}>
          <h2 id="logout-dialog-title" className={styles.modalTitle}>
            로그아웃할까요?
          </h2>
          <p id="logout-dialog-desc" className={styles.modalDescription}>
            로그아웃 시 로그인 화면으로 이동하며,
            <br />
            언제든지 다시 로그인할 수 있습니다.
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




    </MobileFrame>
  );
}
