"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import AttendanceVoteForm from "@/features/vote/components/attendance/AttendanceVoteForm";
import styles from "@/features/vote/components/vote.module.css";
import { useAttendanceVote } from "@/features/vote/hooks/useAttendanceVote";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

export default function AttendanceVoteScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { context, isLoading, isSubmitting, error, submit } =
    useAttendanceVote(params.groupId);

  const handleSubmit = async (choice: Parameters<typeof submit>[0]) => {
    if (await submit(choice)) {
      router.push(
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
