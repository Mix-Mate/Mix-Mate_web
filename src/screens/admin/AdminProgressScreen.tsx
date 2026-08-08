"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import AdminRoundProgress from "@/features/session/components/AdminRoundProgress";
import { useEndRoundMutation } from "@/features/session/hooks/useEndRoundMutation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import EndRoundDialog from "@/modals/admin/EndRoundDialog";
import Header from "@/shared/ui/Header";
import styles from "./AdminProgressScreen.module.css";

export default function AdminProgressScreen() {
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
      withSessionContext(`/groups/${params.groupId}/home`, searchParams),
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
        withSessionContext(
          `/groups/${params.groupId}/votes/mvp`,
          searchParams,
        ),
      );
      return;
    }

    goHome();
  }, [endRound, goHome, params.groupId, router, searchParams]);

  return (
    <main className={styles.viewport}>
      <section
        className={styles.phone}
        data-testid="admin-progress"
        data-group-id={params.groupId}
      >
        <Header
          title="진행 현황 보기"
          onBack={goHome}
          compact
          smallTitle
        />

        <div className={styles.content}>
          <section className={styles.statusCard} aria-label="현재 진행 상태">
            <p>현재 진행 상태</p>
            <div className={styles.statusRow}>
              <strong>{snapshot.statusLabel}</strong>
              <span className={styles.progressBadge}>
                <span aria-hidden="true" />
                진행 중
              </span>
            </div>
          </section>

          <h2 className={styles.sectionTitle}>진행 순서</h2>

          <section className={styles.progressCard}>
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
      </section>
    </main>
  );
}
