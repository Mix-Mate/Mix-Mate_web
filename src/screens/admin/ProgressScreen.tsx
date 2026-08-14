"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import RoundTwoStatusCard from "@/features/group/components/RoundTwoStatusCard";
import AdminRoundProgress from "@/features/session/components/AdminRoundProgress";
import { useEndRoundMutation } from "@/features/session/hooks/useEndRoundMutation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import EndRoundDialog from "@/modals/admin/EndRoundDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./ProgressScreen.module.css";

export default function ProgressScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? "round1-active",
    "ADMIN",
  );
  const {
    mutate: endRound,
    isPending: isEndingRound,
    error: endRoundError,
  } = useEndRoundMutation();
  const [endRoundDialogOpen, setEndRoundDialogOpen] = useState(false);

  const goHome = useCallback(() => {
    router.push(
      withSessionContext(groupRoutes.home(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  const closeEndRoundDialog = useCallback(() => {
    if (!isEndingRound) setEndRoundDialogOpen(false);
  }, [isEndingRound]);

  const confirmEndRound = useCallback(async () => {
    const result = await endRound(params.groupId, 1);
    if (!result) return;

    setEndRoundDialogOpen(false);

    if (result.nextStatus === "VOTING") {
      router.replace(
        withSessionContext(groupRoutes.mvpVote(params.groupId), searchParams),
      );
      return;
    }

    goHome();
  }, [endRound, goHome, params.groupId, router, searchParams]);

  return (
    <MobileFrame
      className={styles.phone}
      data-testid="admin-progress"
      data-group-id={params.groupId}
    >
      <Header title="진행 현황 보기" onBack={goHome} compact smallTitle />

      <div className={styles.content}>
        <RoundTwoStatusCard
          eyebrow="진행 상태 확인"
          statusLabel={snapshot.statusLabel}
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
          <AdminRoundProgress />
        </section>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.endButton}
          onClick={() => setEndRoundDialogOpen(true)}
        >
          1차 술자리 종료하기
        </button>
      </footer>

      <EndRoundDialog
        open={endRoundDialogOpen}
        round={1}
        isEnding={isEndingRound}
        error={endRoundError}
        onClose={closeEndRoundDialog}
        onConfirm={confirmEndRound}
      />
    </MobileFrame>
  );
}
