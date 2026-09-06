"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import AttendanceVoteForm from "@/features/vote/components/attendance/AttendanceVoteForm";
import styles from "@/features/vote/components/vote.module.css";
import { useAttendanceVote } from "@/features/vote/hooks/useAttendanceVote";
import { useVoteNavigation } from "@/features/vote/hooks/useVoteNavigation";
import { getVotePageRedirect } from "@/features/vote/lib/vote-page-route";
import {
  getSecondRoundVoteUpdatedToastKey,
  SECOND_ROUND_VOTE_UPDATED_MESSAGE,
} from "@/features/vote/lib/second-round";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

export default function AttendanceVoteScreen() {
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const isCorrectionFlow = searchParams.get("mode") === "edit";
  const { data: group } = useAdminGroupQuery(params.groupId);
  const {
    data: voteStatusData,
    isLoading: isVoteStatusLoading,
    error: voteStatusError,
    isComplete,
  } = useVoteStatusQuery(params.groupId, { pollingEnabled: false });

  const myVote = voteStatusData?.participants.find(
    (participant) => participant.participantId === group?.myParticipantId,
  );
  const existingChoice = myVote?.choice ?? null;
  const { context, isLoading, isSubmitting, error, submit } = useAttendanceVote(
    params.groupId,
    existingChoice,
  );
  const hasVoted = myVote ? myVote.choice !== null : false;
  const redirect = getVotePageRedirect(
    params.groupId,
    group,
    isComplete,
    hasVoted,
    isCorrectionFlow,
  );
  const { back, replace } = useVoteNavigation(
    withSessionContext(
      isCorrectionFlow
        ? groupRoutes.voteStatus(params.groupId)
        : (redirect ?? groupRoutes.mvpVote(params.groupId)),
      searchParams,
    ),
  );

  useEffect(() => {
    if (redirect) replace(withSessionContext(redirect, searchParams));
  }, [redirect, replace, searchParams]);

  const handleSubmit = async (choice: Parameters<typeof submit>[0]) => {
    if (!group || redirect) return;
    const result = await submit(choice);

    if (result.success) {
      if (result.isUpdated) {
        window.sessionStorage.setItem(
          getSecondRoundVoteUpdatedToastKey(params.groupId),
          SECOND_ROUND_VOTE_UPDATED_MESSAGE,
        );
      }
      replace(
        withSessionContext(
          groupRoutes.voteStatus(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (result.isAlreadyVoted) {
      replace(
        withSessionContext(
          groupRoutes.voteStatus(params.groupId),
          searchParams,
        ),
      );
    }
  };

  return (
    <VoteScreenLayout
      title="2차 참여 여부"
      status={context.status}
      onBack={back}
      testId="attendance-vote-screen"
      flushContent
    >
      <section className={styles.attendanceScreen}>
        <AttendanceVoteForm
          initialChoice={context.selectedChoice}
          isSubmitted={context.hasSubmitted}
          isClosed={context.status === "CLOSED" || !group || redirect !== null}
          isLoading={isLoading || isVoteStatusLoading || !voteStatusData}
          isSubmitting={isSubmitting}
          error={error ?? voteStatusError}
          onSubmit={(choice) => {
            void handleSubmit(choice);
          }}
        />
      </section>
    </VoteScreenLayout>
  );
}
