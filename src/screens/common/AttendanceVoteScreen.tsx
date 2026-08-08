"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import AttendanceVoteForm from "@/features/vote/components/attendance/AttendanceVoteForm";
import styles from "@/features/vote/components/vote.module.css";
import { useAttendanceVote } from "@/features/vote/hooks/useAttendanceVote";
import { useMvpVote } from "@/features/vote/hooks/useMvpVote";
import VoteScreenLayout from "./VoteScreenLayout";

export default function AttendanceVoteScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { context: mvpContext } = useMvpVote(params.groupId);
  const { context, error, submit } = useAttendanceVote(
    params.groupId,
    mvpContext.currentMemberId,
  );

  const handleSubmit = (choice: Parameters<typeof submit>[0]) => {
    if (submit(choice)) {
      router.push(
        withSessionContext(
          `/groups/${params.groupId}/votes/status`,
          searchParams,
        ),
      );
    }
  };

  return (
    <VoteScreenLayout
      title="2차 참여 여부"
      status={context.status}
      backHref={`/groups/${params.groupId}/votes/mvp`}
      testId="attendance-vote-screen"
    >
      <section className={styles.attendanceScreen}>
        <AttendanceVoteForm
          initialChoice={context.selectedChoice}
          isSubmitted={context.hasSubmitted}
          isClosed={context.status === "CLOSED"}
          error={error}
          onSubmit={handleSubmit}
        />
      </section>
    </VoteScreenLayout>
  );
}
