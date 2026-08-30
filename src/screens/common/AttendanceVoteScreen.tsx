"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import AttendanceVoteForm from "@/features/vote/components/attendance/AttendanceVoteForm";
import styles from "@/features/vote/components/vote.module.css";
import { useAttendanceVote } from "@/features/vote/hooks/useAttendanceVote";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

export default function AttendanceVoteScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { data: voteStatusData, isComplete } = useVoteStatusQuery(
    params.groupId,
    { pollingEnabled: false },
  );
  const { context, isLoading, isSubmitting, error, submit } =
    useAttendanceVote(params.groupId);

  const isAdmin = group?.myRole === "HOST";
  const myVote = voteStatusData?.participants.find(
    (participant) => participant.participantId === group?.myParticipantId,
  );
  const hasVoted = myVote ? myVote.choice !== null : false;
  const isVoteFinished = Boolean(
    isComplete ||
      group?.status === "VOTE_CLOSED" ||
      group?.status === "BEFORE_SECOND_ROUND" ||
      group?.status === "SECOND_ROUND" ||
      group?.status === "FINISHED",
  );

  useEffect(() => {
    if (!group) return;

    if (isVoteFinished) {
      router.replace(
        withSessionContext(
          groupRoutes.voteResult(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (hasVoted) {
      router.replace(
        withSessionContext(
          isAdmin
            ? groupRoutes.adminVoteStatus(params.groupId)
            : groupRoutes.voteResult(params.groupId),
          searchParams,
        ),
      );
      return;
    }
  }, [group, isVoteFinished, hasVoted, isAdmin, params.groupId, router, searchParams]);

  const handleSubmit = async (choice: Parameters<typeof submit>[0]) => {
    const result = await submit(choice);

    if (result === true || (typeof result === "object" && result.success)) {
      router.replace(
        withSessionContext(
          isAdmin
            ? groupRoutes.adminVoteStatus(params.groupId)
            : groupRoutes.voteStatus(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (typeof result === "object" && result.isAlreadyVoted) {
      router.replace(
        withSessionContext(
          isAdmin
            ? groupRoutes.adminVoteStatus(params.groupId)
            : groupRoutes.voteResult(params.groupId),
          searchParams,
        ),
      );
    }
  };

  return (
    <VoteScreenLayout
      title="2차 참여 여부"
      status={context.status}
      backHref={groupRoutes.mvpVote(params.groupId)}
      testId="attendance-vote-screen"
    >
      <section className={styles.attendanceScreen}>
        <AttendanceVoteForm
          initialChoice={context.selectedChoice}
          isSubmitted={context.hasSubmitted}
          isClosed={context.status === "CLOSED"}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={(choice) => {
            void handleSubmit(choice);
          }}
        />
      </section>
    </VoteScreenLayout>
  );
}
