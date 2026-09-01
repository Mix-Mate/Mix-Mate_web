"use client";

import { AlertTriangle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import AdminVoteEndButton from "@/features/vote/components/status/AdminVoteEndButton";
import VoteCompletionWatcher from "@/features/vote/components/status/VoteCompletionWatcher";
import VoteProgressCard from "@/features/vote/components/status/VoteProgressCard";
import styles from "@/features/vote/components/status/VoteStatus.module.css";
import VoteStatusList from "@/features/vote/components/status/VoteStatusList";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import { useVoteNavigation } from "@/features/vote/hooks/useVoteNavigation";
import type { SecondRoundVoteStatusFilter } from "@/features/vote/types/secondRoundVoteStatus.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import MainHomeExitPopup from "@/modals/user/MainHomeExitPopup";
import { appRoutes, groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

export default function VoteStatusScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const isAdmin = group?.myRole === "HOST";
  const canForceEndVote = isAdmin && group?.status === "VOTING";
  const { data, isLoading, isRefreshing, error, isComplete } =
    useVoteStatusQuery(params.groupId);
  const { back: navigateToMainHome } = useVoteNavigation(appRoutes.home());
  const [selectedFilter, setSelectedFilter] =
    useState<SecondRoundVoteStatusFilter>("PENDING");
  const [mainHomeExitPopupOpen, setMainHomeExitPopupOpen] = useState(false);
  const pendingCount = data
    ? Math.max(0, data.totalParticipantCount - data.votedCount)
    : 0;
  const listContent = data
    ? {
        PARTICIPATE: {
          title: "2차 참여 명단",
          members: data.participants.filter(
            (participant) => participant.choice === "PARTICIPATE",
          ),
          emptyMessage: "2차 참여를 선택한 참가자가 없습니다.",
        },
        NOT_PARTICIPATE: {
          title: "불참 명단",
          members: data.participants.filter(
            (participant) => participant.choice === "NOT_PARTICIPATE",
          ),
          emptyMessage: "불참을 선택한 참가자가 없습니다.",
        },
        PENDING: {
          title: "미투표 멤버",
          members: data.participants.filter(
            (participant) => participant.choice === null,
          ),
          emptyMessage: "모든 참가자가 투표를 완료했습니다.",
        },
      }[selectedFilter]
    : null;
  const showVoteResult = useCallback(() => {
    router.replace(
      withSessionContext(groupRoutes.voteResult(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  useEffect(() => {
    if (!group) return;

    if (group.myRole === "HOST") {
      router.replace(
        withSessionContext(
          groupRoutes.adminVoteStatus(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    const isVoteFinished =
      group.status === "VOTE_CLOSED" ||
      group.status === "BEFORE_SECOND_ROUND" ||
      group.status === "SECOND_ROUND" ||
      group.status === "FINISHED";

    if (isVoteFinished) {
      showVoteResult();
    }
  }, [group, params.groupId, router, searchParams, showVoteResult]);

  const showAdminVoteEnd = useCallback(() => {
    router.push(
      withSessionContext(
        groupRoutes.adminVoteEnd(params.groupId),
        searchParams,
      ),
    );
  }, [params.groupId, router, searchParams]);

  const requestMainHomeExit = useCallback(() => {
    setMainHomeExitPopupOpen(true);
  }, []);

  const closeMainHomeExitPopup = useCallback(() => {
    setMainHomeExitPopupOpen(false);
  }, []);

  const confirmMainHomeExit = useCallback(() => {
    setMainHomeExitPopupOpen(false);
    navigateToMainHome();
  }, [navigateToMainHome]);

  if (isAdmin) {
    return null;
  }

  return (
    <VoteScreenLayout
      title="투표 현황"
      status={isComplete ? "CLOSED" : "OPEN"}
      onBack={requestMainHomeExit}
      testId="vote-status-screen"
    >
      <section
        className={styles.statusScreen}
        data-role={isAdmin ? "ADMIN" : "USER"}
      >
        {isLoading ? (
          <p className={styles.queryState} role="status">
            투표 현황을 불러오는 중입니다.
          </p>
        ) : !data || !listContent ? (
          <p
            className={`${styles.queryState} ${styles.queryError}`}
            role="alert"
          >
            {error ?? "투표 현황을 불러오지 못했습니다."}
          </p>
        ) : (
          <>
            <VoteProgressCard
              totalCount={data.totalParticipantCount}
              completedCount={data.votedCount}
              attendanceCount={data.participateCount}
              absenceCount={data.notParticipateCount}
              pendingCount={pendingCount}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
            />

            <VoteStatusList
              title={listContent.title}
              members={listContent.members}
              emptyMessage={listContent.emptyMessage}
            />

            {error && (
              <p className={styles.waitingNotice} role="alert">
                <AlertTriangle aria-hidden="true" size={17} strokeWidth={2} />
                {error}
              </p>
            )}

            {!isComplete && !error && (
              <p className={styles.waitingNotice}>
                <AlertTriangle aria-hidden="true" size={17} strokeWidth={2} />
                {canForceEndVote
                  ? "미투표자가 있습니다. 관리자가 수동으로 투표를 종료할 수 있습니다."
                  : "미투표자가 있습니다. 투표가 완료되면 결과를 확인할 수 있습니다."}
              </p>
            )}

            {canForceEndVote && !isComplete && (
              <AdminVoteEndButton onEnd={showAdminVoteEnd} />
            )}

            <span className={styles.visuallyHidden} aria-live="polite">
              {isRefreshing ? "투표 현황을 갱신하고 있습니다." : ""}
            </span>

            <VoteCompletionWatcher
              isComplete={isComplete}
              onComplete={showVoteResult}
            />
          </>
        )}
      </section>

      <MainHomeExitPopup
        open={mainHomeExitPopupOpen}
        onClose={closeMainHomeExitPopup}
        onConfirm={confirmMainHomeExit}
      />
    </VoteScreenLayout>
  );
}
