"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import VoteResultContent from "@/features/vote/components/result/VoteResultContent";
import styles from "@/features/vote/components/result/VoteResult.module.css";
import { useVoteResultQuery } from "@/features/vote/hooks/useVoteResultQuery";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

export default function VoteResultScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const {
    data: group,
    isLoading: isGroupLoading,
    error: groupError,
  } = useAdminGroupQuery(params.groupId);
  const { data, isLoading, error } = useVoteResultQuery(params.groupId);
  const { data: firstRoundTeam, isLoading: isTeamLoading } = useMyTeamQuery(
    params.groupId,
    "FIRST_ROUND",
  );
  const isAdmin = group?.myRole === "HOST";
  const homeHref = groupRoutes.home(params.groupId);
  const resultHomeHref = isAdmin
    ? withSessionContext(`${homeHref}?dialog=post-vote`, searchParams)
    : `${homeHref}?scenario=round2-waiting`;
  const myTeamMvpWinner = firstRoundTeam
    ? (data?.mvpWinners.find(
        (winner) => winner.teamNumber === firstRoundTeam.teamNumber,
      ) ?? null)
    : null;

  return (
    <VoteScreenLayout
      title="투표 결과"
      status="CLOSED"
      backHref={homeHref}
      testId="vote-result-screen"
      showStatusBadge={false}
      flushContent
    >
      {data && !isTeamLoading && group ? (
        <VoteResultContent
          result={data}
          introMvpWinner={myTeamMvpWinner}
          onHome={() => router.replace(resultHomeHref)}
          onOpenMvpList={() =>
            router.push(
              withSessionContext(
                groupRoutes.voteResultMvpList(params.groupId),
                searchParams,
              ),
            )
          }
          onOpenSecondRoundParticipantList={() =>
            router.push(
              withSessionContext(
                groupRoutes.voteResultSecondRoundParticipants(params.groupId),
                searchParams,
              ),
            )
          }
        />
      ) : (
        <section className={styles.resultQueryScreen}>
          <p
            className={`${styles.resultQueryState} ${
              error ? styles.resultQueryError : ""
            }`}
            role={error || groupError ? "alert" : "status"}
          >
            {error ??
              groupError ??
              (isLoading || isTeamLoading || isGroupLoading
                ? "투표 결과를 불러오는 중입니다."
                : "투표 결과를 불러오지 못했습니다.")}
          </p>
        </section>
      )}
    </VoteScreenLayout>
  );
}
