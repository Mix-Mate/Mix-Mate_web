"use client";

import { Info, Trophy } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MvpVoteForm from "@/features/vote/components/mvp/MvpVoteForm";
import styles from "@/features/vote/components/vote.module.css";
import { useMvpVote } from "@/features/vote/hooks/useMvpVote";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

export default function MvpVoteScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { context, error, submit } = useMvpVote(params.groupId);

  const handleSubmit = (candidateId: string) => {
    if (context.hasSubmitted || submit(candidateId)) {
      router.push(
        withSessionContext(
          groupRoutes.attendanceVote(params.groupId),
          searchParams,
        ),
      );
    }
  };

  return (
    <VoteScreenLayout
      title="MVP 투표"
      status={context.status}
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
          initialCandidateId={context.selectedCandidateId}
          isSubmitted={context.hasSubmitted}
          isClosed={context.status === "CLOSED"}
          error={error}
          onSubmit={handleSubmit}
        />
      </section>
    </VoteScreenLayout>
  );
}
