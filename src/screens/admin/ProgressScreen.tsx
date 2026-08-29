"use client";

import { Power } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import RoundTwoStatusCard from "@/features/group/components/RoundTwoStatusCard";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useFinishFirstRoundMutation } from "@/features/group/hooks/useFinishFirstRoundMutation";
import { useFinishGroupMutation } from "@/features/group/hooks/useFinishGroupMutation";
import {
  canFinishGroup,
  getCurrentGroupRound,
  getGroupStatusLabel,
  toEventStatus,
} from "@/features/group/model/group-status";
import AdminRoundProgress from "@/features/session/components/AdminRoundProgress";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import EndRoundDialog from "@/modals/admin/EndRoundDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./ProgressScreen.module.css";

export default function ProgressScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group, refetch } = useAdminGroupQuery(params.groupId);
  const {
    mutate: finishFirstRound,
    isPending: isFinishingFirstRound,
    error: finishFirstRoundError,
  } = useFinishFirstRoundMutation();
  const {
    mutate: finishGroup,
    isPending: isFinishingGroup,
    error: finishGroupError,
  } = useFinishGroupMutation();
  const endRoundFlowInFlightRef = useRef(false);
  const [endRoundDialogOpen, setEndRoundDialogOpen] = useState(false);
  const [isRefreshingGroup, setIsRefreshingGroup] = useState(false);
  const [statusRefreshError, setStatusRefreshError] = useState<string | null>(
    null,
  );
  const currentStatus = group ? toEventStatus(group.status) : null;
  const currentRound = group ? getCurrentGroupRound(group.status) : null;
  const canEndCurrentRound =
    group?.myRole === "HOST" &&
    ((group.status === "FIRST_ROUND" &&
      currentStatus === "FIRST_IN_PROGRESS") ||
      (group.status === "SECOND_ROUND" &&
        currentStatus === "SECOND_IN_PROGRESS" &&
        canFinishGroup(group.status)));
  const isEndingRound =
    isFinishingFirstRound || isFinishingGroup || isRefreshingGroup;
  const endRoundError =
    statusRefreshError ??
    (currentRound === 1 ? finishFirstRoundError : finishGroupError);

  const goHome = useCallback(() => {
    router.push(
      withSessionContext(groupRoutes.home(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  const closeEndRoundDialog = useCallback(() => {
    if (!isEndingRound) setEndRoundDialogOpen(false);
  }, [isEndingRound]);

  const confirmEndRound = useCallback(async () => {
    if (
      !canEndCurrentRound ||
      !currentRound ||
      isEndingRound ||
      endRoundFlowInFlightRef.current
    ) {
      return;
    }

    endRoundFlowInFlightRef.current = true;
    setStatusRefreshError(null);

    try {
      if (currentRound === 1) {
        const didFinish = await finishFirstRound(params.groupId);
        if (!didFinish) return;

        setIsRefreshingGroup(true);

        const refreshedGroup = await refetch();

        if (!refreshedGroup) {
          setStatusRefreshError("그룹 상태를 다시 확인하지 못했습니다.");
          return;
        }

        if (refreshedGroup.status !== "VOTING") {
          setStatusRefreshError("투표 시작 상태를 확인하지 못했습니다.");
          return;
        }

        setEndRoundDialogOpen(false);
        router.replace(
          withSessionContext(groupRoutes.mvpVote(params.groupId), searchParams),
        );
        return;
      }

      const didFinish = await finishGroup(params.groupId);
      if (!didFinish) return;

      setIsRefreshingGroup(true);

      const refreshedGroup = await refetch();

      if (!refreshedGroup) {
        setStatusRefreshError("그룹 상태를 다시 확인하지 못했습니다.");
        return;
      }

      if (refreshedGroup.status !== "FINISHED") {
        setStatusRefreshError("모임 종료 상태를 확인하지 못했습니다.");
        return;
      }

      setEndRoundDialogOpen(false);
      router.replace(
        withSessionContext(groupRoutes.completed(params.groupId), searchParams),
      );
    } finally {
      endRoundFlowInFlightRef.current = false;
      setIsRefreshingGroup(false);
    }
  }, [
    canEndCurrentRound,
    currentRound,
    finishFirstRound,
    finishGroup,
    isEndingRound,
    params.groupId,
    refetch,
    router,
    searchParams,
  ]);

  if (!group || !currentStatus || !currentRound) return null;

  return (
    <MobileFrame
      className={styles.phone}
      data-testid="admin-progress"
      data-group-id={params.groupId}
      data-status={group.status}
    >
      <Header title="진행 현황 보기" onBack={goHome} />

      <div className={styles.content}>
        <RoundTwoStatusCard
          eyebrow="진행 상태 확인"
          statusLabel={getGroupStatusLabel(group.status)}
          showEditButton={false}
        />

        <section
          className={styles.progressCard}
          aria-labelledby="event-status-title"
        >
          <div className={styles.progressHeading}>
            <p>Event Status</p>
            <h2 id="event-status-title">지금 진행 상황</h2>
          </div>
          <AdminRoundProgress currentStatus={currentStatus} />
        </section>
      </div>

      {canEndCurrentRound && (
        <footer className={styles.footer}>
          <Button
            variant="danger"
            className={styles.endButton}
            disabled={isEndingRound}
            onClick={() => {
              setStatusRefreshError(null);
              setEndRoundDialogOpen(true);
            }}
          >
            <Power aria-hidden="true" size={21} strokeWidth={1.9} />
            {currentRound}차 술자리 종료하기
          </Button>
        </footer>
      )}

      <EndRoundDialog
        open={endRoundDialogOpen}
        round={currentRound}
        isEnding={isEndingRound}
        error={endRoundError}
        onClose={closeEndRoundDialog}
        onConfirm={confirmEndRound}
      />
    </MobileFrame>
  );
}
