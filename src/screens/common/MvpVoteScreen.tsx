"use client";

import { Info, Trophy } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import MvpVoteForm from "@/features/vote/components/mvp/MvpVoteForm";
import styles from "@/features/vote/components/vote.module.css";
import { useMvpVote } from "@/features/vote/hooks/useMvpVote";
import { useVoteNavigation } from "@/features/vote/hooks/useVoteNavigation";
import { getVotePageRedirect } from "@/features/vote/lib/vote-page-route";
import { withSessionContext } from "@/features/session/utils/session-navigation";
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
  const { back, replace } = useVoteNavigation(appRoutes.home());

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
      onBack={back}
      testId="mvp-vote-screen"
    >
      <section className={styles.mvpScreen}>
        <header className={styles.introCard}>
          <Trophy
            className={styles.introIcon}
            aria-hidden="true"
            size={30}
            strokeWidth={1.7}
          />
          <h2>오늘의 분위기 메이커는?</h2>
          <p>
            1차 술자리를 가장 빛낸 사람에게 투표해 주세요.
            <br />
            같은 조 멤버 중 한 명만 선택할 수 있어요.
          </p>
        </header>

        <aside className={styles.ruleNotice}>
          <Info aria-hidden="true" size={16} strokeWidth={1.8} />
          <p>
            자신에게는 투표할 수 없습니다.
            <br />
            개별 투표는 공개되지 않습니다.
          </p>
        </aside>

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
    </VoteScreenLayout>
  );
}
