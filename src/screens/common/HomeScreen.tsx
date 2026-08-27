"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ChevronRight } from "lucide-react";
import MobileFrame from "@/shared/ui/MobileFrame";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import {
  getMyGroupsApi,
  MyGroupItem,
  GroupApiError,
} from "@/features/group/api/group.api";
import { clearAuthTokens } from "@/shared/api/authToken";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import styles from "./HomeScreen.module.css";

interface HomeScreenProps {
  userName?: string;
  initialActiveGroups?: MyGroupItem[];
  initialCompletedGroups?: MyGroupItem[];
}

export default function HomeScreen({
  userName: initialUserName = "사용자",
  initialActiveGroups = [],
  initialCompletedGroups = [],
}: HomeScreenProps) {
  const router = useRouter();

  const [userName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const storedName =
        window.localStorage.getItem("userName") ||
        window.localStorage.getItem("user");
      if (storedName) {
        try {
          const parsed = JSON.parse(storedName) as {
            userName?: string;
            name?: string;
          };
          return parsed?.userName || parsed?.name || storedName;
        } catch {
          return storedName;
        }
      }
    }
    return initialUserName;
  });

  const [activeGroups, setActiveGroups] =
    useState<MyGroupItem[]>(initialActiveGroups);
  const [completedGroups, setCompletedGroups] = useState<MyGroupItem[]>(
    initialCompletedGroups,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMyGroups = async () => {
      setIsLoading(true);
      try {
        const [activeRes, finishedRes] = await Promise.allSettled([
          getMyGroupsApi({ scope: "me", state: "active" }),
          getMyGroupsApi({ scope: "me", state: "finished" }),
        ]);

        if (activeRes.status === "rejected") {
          const err = activeRes.reason;
          if (err instanceof GroupApiError && err.status === 401) {
            alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
            clearAuthTokens();
            router.push("/login");
            return;
          }
        }

        if (isMounted) {
          if (activeRes.status === "fulfilled") {
            setActiveGroups(activeRes.value.groups || []);
          }
          if (finishedRes.status === "fulfilled") {
            setCompletedGroups(finishedRes.value.groups || []);
          }
        }
      } catch (err: unknown) {
        console.error("내 그룹 목록 조회 실패:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMyGroups();

    return () => {
      isMounted = false;
    };
  }, [initialUserName, router]);

  // Navigation handlers
  const handleGroupClick = (group: MyGroupItem) => {
    if (group.status === "FINISHED") {
      router.push(groupRoutes.completed(String(group.groupId)));
    } else {
      router.push(groupRoutes.home(String(group.groupId)));
    }
  };

  // Logout flow
  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    clearAuthTokens();
    router.push("/login");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "RECRUITING":
        return "모집 중";
      case "PROGRESS":
      case "FIRST_ROUND":
      case "SECOND_ROUND":
        return "진행 중";
      case "VOTING":
        return "투표 진행 중";
      case "FINISHED":
        return "종료됨";
      default:
        return status || "진행 중";
    }
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="home-screen"
    >
      {/* 1. 상단 헤더: MixMate 제목 & 로그아웃 버튼 */}
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
          <h2 className={styles.welcomeTitle}>안녕하세요, {userName}님 👋</h2>
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
                  const isHost = group.role === "HOST";

                  return (
                    <article
                      key={group.groupId}
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
                        <h4 className={styles.groupName}>{group.groupName}</h4>

                        <p className={styles.groupMetaText}>
                          {getStatusLabel(group.status)} · {group.memberCount}명
                        </p>

                        <div className={styles.roleTagWrap}>
                          <span
                            className={`${styles.roleTag} ${
                              isHost ? styles.roleTagAdmin : styles.roleTagUser
                            }`}
                          >
                            {isHost ? "관리자" : "사용자"}
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
              <h3
                className={`${styles.sectionTitle} ${styles.sectionTitleCompleted}`}
              >
                종료된 그룹 목록
              </h3>
            </div>

            {isLoading ? (
              <div className={styles.skeletonList}>
                <div className={styles.skeletonCardCompleted} />
              </div>
            ) : completedGroups.length > 0 ? (
              <div className={styles.completedGroupList}>
                {completedGroups.map((group) => (
                  <div
                    key={group.groupId}
                    className={styles.completedGroupItem}
                    onClick={() => handleGroupClick(group)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className={styles.completedGroupName}>
                      {group.groupName}
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
