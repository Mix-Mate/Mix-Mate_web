"use client";

import { CircleCheck, Info, UsersRound } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { useFinishVoteMutation } from "@/features/vote/hooks/useFinishVoteMutation";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import EndVoteDialog from "@/modals/admin/EndVoteDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./EndVoteScreen.module.css";

export default function EndVoteScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group, refetch: refetchGroup } = useAdminGroupQuery(
    params.groupId,
  );
  const isAdmin = group?.myRole === "HOST";
  const isVoteInProgress = group?.status === "VOTING";
  const {
    data,
    isLoading,
    error: voteStatusError,
    refetch: refetchVoteStatus,
  } = useVoteStatusQuery(params.groupId, {
    pollingEnabled: isVoteInProgress,
  });
  const {
    mutate: finishVote,
    isPending: isFinishVotePending,
    error: finishVoteError,
  } = useFinishVoteMutation();
  const finishFlowInFlightRef = useRef(false);
  const [endVoteDialogOpen, setEndVoteDialogOpen] = useState(false);
  const [isRefreshingServerState, setIsRefreshingServerState] = useState(false);
  const [statusRefreshError, setStatusRefreshError] = useState<string | null>(
    null,
  );
  const isFinishingVote = isFinishVotePending || isRefreshingServerState;
  const endVoteError = statusRefreshError ?? finishVoteError;

  const showVoteStatus = useCallback(() => {
    router.push(
      withSessionContext(groupRoutes.voteStatus(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  const closeEndVoteDialog = useCallback(() => {
    if (!isFinishingVote) setEndVoteDialogOpen(false);
  }, [isFinishingVote]);

  const confirmEndVote = useCallback(async () => {
    if (
      !isAdmin ||
      !isVoteInProgress ||
      isFinishingVote ||
      finishFlowInFlightRef.current
    ) {
      return;
    }

    finishFlowInFlightRef.current = true;
    setStatusRefreshError(null);

    try {
      const didFinish = await finishVote(params.groupId);
      if (!didFinish) return;

      setIsRefreshingServerState(true);

      const refreshedGroup = await refetchGroup();

      if (!refreshedGroup) {
        setStatusRefreshError("그룹 상태를 다시 확인하지 못했습니다.");
        return;
      }

      if (refreshedGroup.status === "VOTING") {
        setStatusRefreshError("투표 종료 상태를 확인하지 못했습니다.");
        return;
      }

      const refreshedVoteStatus = await refetchVoteStatus();

      if (!refreshedVoteStatus) {
        setStatusRefreshError("최종 투표 현황을 다시 확인하지 못했습니다.");
        return;
      }

      setEndVoteDialogOpen(false);
      router.replace(
        withSessionContext(
          groupRoutes.voteResult(params.groupId),
          searchParams,
        ),
      );
    } finally {
      finishFlowInFlightRef.current = false;
      setIsRefreshingServerState(false);
    }
  }, [
    finishVote,
    isAdmin,
    isFinishingVote,
    isVoteInProgress,
    params.groupId,
    refetchGroup,
    refetchVoteStatus,
    router,
    searchParams,
  ]);

  if (!isAdmin) return null;

  if (!data) {
    return (
      <MobileFrame
        className={styles.phone}
        data-testid="admin-vote-end-screen"
        data-group-id={params.groupId}
        data-role="ADMIN"
      >
        <Header title="투표 종료" onBack={showVoteStatus} />
        <div className={styles.content}>
          <p
            className={`${styles.queryState} ${
              voteStatusError ? styles.queryError : ""
            }`}
            role={voteStatusError ? "alert" : "status"}
          >
            {voteStatusError ??
              (isLoading
                ? "투표 현황을 불러오는 중입니다."
                : "투표 현황을 불러오지 못했습니다.")}
          </p>
        </div>
      </MobileFrame>
    );
  }

  const pendingMembers = data.participants.filter(
    (participant) => participant.manualEntry || participant.choice === null,
  );

  return (
    <MobileFrame
      className={styles.phone}
      data-testid="admin-vote-end-screen"
      data-group-id={params.groupId}
      data-role="ADMIN"
    >
      <Header title="투표 종료" onBack={showVoteStatus} />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>종료 시 확정되는 정보</h2>

        <div className={styles.summaryList}>
          <section className={styles.summaryCard} aria-label="2차 참여자">
            <span className={styles.summaryIcon} aria-hidden="true">
              <UsersRound size={24} strokeWidth={1.8} />
            </span>
            <div className={styles.summaryContent}>
              <span className={styles.summaryValue}>
                <small>2차 참여자</small>
                <strong>{data.participateCount}명</strong>
              </span>
              <span className={styles.summaryDescription}>참여 선택 인원</span>
            </div>
          </section>

          <section className={styles.summaryCard} aria-label="투표 완료">
            <span className={styles.summaryIcon} aria-hidden="true">
              <CircleCheck size={24} strokeWidth={1.8} />
            </span>
            <div className={styles.summaryContent}>
              <span className={styles.summaryValue}>
                <small>투표 완료</small>
                <strong>
                  {data.votedCount} / {data.totalParticipantCount}
                </strong>
              </span>
              <span className={styles.summaryDescription}>
                전체 대비 완료 인원
              </span>
            </div>
          </section>
        </div>

        <section className={styles.infoCard} aria-labelledby="mvp-info-title">
          <Info aria-hidden="true" size={17} strokeWidth={1.9} />
          <div>
            <h2 id="mvp-info-title">MVP 결과 처리 안내</h2>
            <p>
              MVP 결과는 <strong>오늘의 분위기 메이커</strong>로 공개됩니다.
              <br />
              동점자가 여러 명이면 모두 공동 MVP로 선정합니다.
            </p>
          </div>
        </section>
      </div>

      {isVoteInProgress && (
        <footer className={styles.footer}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={showVoteStatus}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.endButton}
            disabled={isFinishingVote}
            onClick={() => {
              setStatusRefreshError(null);
              setEndVoteDialogOpen(true);
            }}
          >
            투표 종료하기
          </button>
        </footer>
      )}

      <EndVoteDialog
        open={endVoteDialogOpen}
        groupId={params.groupId}
        pendingMembers={pendingMembers}
        isEnding={isFinishingVote}
        error={endVoteError}
        onClose={closeEndVoteDialog}
        onConfirm={confirmEndVote}
        onVoteChange={() => {
          void refetchVoteStatus();
        }}
      />
    </MobileFrame>
  );
}
