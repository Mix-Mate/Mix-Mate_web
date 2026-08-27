"use client";

import { Power } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import RoundTwoStatusCard from "@/features/group/components/RoundTwoStatusCard";
import { useFinishFirstRoundMutation } from "@/features/group/hooks/useFinishFirstRoundMutation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import {
  getCurrentGroupRound,
  getGroupStatusLabel,
  toEventStatus,
} from "@/features/group/model/group-status";
import AdminRoundProgress from "@/features/session/components/AdminRoundProgress";
import { useEndRoundMutation } from "@/features/session/hooks/useEndRoundMutation";
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
  const { data: group } = useAdminGroupQuery(params.groupId);
  const {
    mutate: finishFirstRound,
    isPending: isFinishingFirstRound,
    error: finishFirstRoundError,
  } = useFinishFirstRoundMutation();
  const {
    mutate: endRound,
    isPending: isEndingSecondRound,
    error: endSecondRoundError,
  } = useEndRoundMutation();
  const [endRoundDialogOpen, setEndRoundDialogOpen] = useState(false);
  const currentStatus = group ? toEventStatus(group.status) : null;
  const currentRound = group ? getCurrentGroupRound(group.status) : null;
  const canEndCurrentRound =
    (currentRound === 1 && currentStatus === "FIRST_IN_PROGRESS") ||
    (currentRound === 2 && currentStatus === "SECOND_IN_PROGRESS");
  const isEndingRound = isFinishingFirstRound || isEndingSecondRound;
  const endRoundError =
    currentRound === 1 ? finishFirstRoundError : endSecondRoundError;

  const goHome = useCallback(() => {
    router.push(
      withSessionContext(groupRoutes.home(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  const closeEndRoundDialog = useCallback(() => {
    if (!isEndingRound) setEndRoundDialogOpen(false);
  }, [isEndingRound]);

  const confirmEndRound = useCallback(async () => {
    if (!canEndCurrentRound || !currentRound) return;

    if (currentRound === 1) {
      const didFinish = await finishFirstRound(params.groupId);
      if (!didFinish) return;

      setEndRoundDialogOpen(false);
      router.replace(
        withSessionContext(groupRoutes.mvpVote(params.groupId), searchParams),
      );

      return;
    }

    const result = await endRound(params.groupId, currentRound);
    if (!result) return;

    setEndRoundDialogOpen(false);

    router.replace(
      withSessionContext(groupRoutes.completed(params.groupId), searchParams),
    );
  }, [
    canEndCurrentRound,
    currentRound,
    endRound,
    finishFirstRound,
    params.groupId,
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
            onClick={() => setEndRoundDialogOpen(true)}
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
