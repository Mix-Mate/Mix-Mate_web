"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import MvpVoteForm from "@/features/vote/components/mvp/MvpVoteForm";
import styles from "@/features/vote/components/vote.module.css";
import { useMvpVote } from "@/features/vote/hooks/useMvpVote";
import { useVoteNavigation } from "@/features/vote/hooks/useVoteNavigation";
import { getVotePageRedirect } from "@/features/vote/lib/vote-page-route";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import MainHomeExitPopup from "@/modals/user/MainHomeExitPopup";
import { appRoutes, groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

export default function MvpVoteScreen() {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { data: voteStatusData, isComplete } = useVoteStatusQuery(
    params.groupId,
    { pollingEnabled: false },
  );
  const { context, isLoading, isSubmitting, error, submit } = useMvpVote(
    params.groupId,
  );

  const myVote = voteStatusData?.participants.find(
    (participant) => participant.participantId === group?.myParticipantId,
  );
  const hasVoted = myVote ? myVote.choice !== null : false;
  const redirect = getVotePageRedirect(
    params.groupId,
    group,
    isComplete,
    hasVoted,
  );
  const { back: navigateToMainHome, replace } = useVoteNavigation(
    appRoutes.home(),
  );
  const [mainHomeExitPopupOpen, setMainHomeExitPopupOpen] = useState(false);

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

  useEffect(() => {
    if (redirect) replace(withSessionContext(redirect, searchParams));
  }, [redirect, replace, searchParams]);

  const handleSubmit = async (targetParticipantId: number) => {
    if (!group || redirect) return;
    const result = await submit(targetParticipantId);

    if (result.success || result.isAlreadyVoted) {
      replace(
        withSessionContext(
          groupRoutes.attendanceVote(params.groupId),
          searchParams,
        ),
      );
      return;
    }
  };

  return (
    <VoteScreenLayout
      title="MVP 투표"
      status={context.status}
      onBack={requestMainHomeExit}
      testId="mvp-vote-screen"
      flushContent
    >
      <section className={styles.mvpScreen}>
        <MvpVoteForm
          candidates={context.candidates}
          initialParticipantId={context.selectedParticipantId}
          isSubmitted={context.hasSubmitted}
          isClosed={context.status === "CLOSED" || !group || redirect !== null}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={(targetParticipantId) => {
            void handleSubmit(targetParticipantId);
          }}
        />
      </section>

      <MainHomeExitPopup
        open={mainHomeExitPopupOpen}
        onClose={closeMainHomeExitPopup}
        onConfirm={confirmMainHomeExit}
      />
    </VoteScreenLayout>
  );
}
