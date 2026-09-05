"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import VoteResultContent from "@/features/vote/components/result/VoteResultContent";
import styles from "@/features/vote/components/result/VoteResult.module.css";
import { useVoteResultQuery } from "@/features/vote/hooks/useVoteResultQuery";
import MainHomeExitPopup from "@/modals/user/MainHomeExitPopup";
import { appRoutes, groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

type MainHomeExitReason = "header" | "second-round-absent";

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
  const [mainHomeExitReason, setMainHomeExitReason] =
    useState<MainHomeExitReason | null>(null);
  const { data: firstRoundTeam, isLoading: isTeamLoading } = useMyTeamQuery(
    params.groupId,
    "FIRST_ROUND",
  );
  const isAdmin = group?.myRole === "HOST";
  const homeHref = groupRoutes.home(params.groupId);
  const overallResultHref = withSessionContext(
    `${groupRoutes.voteResult(params.groupId)}?view=overall`,
    searchParams,
  );
  const showOverallResult = searchParams.get("view") === "overall";
  const didJoinSecondRound = data?.secondRoundParticipants.some(
    (participant) => participant.participantId === group?.myParticipantId,
  );
  const footerHomeHref = isAdmin
    ? withSessionContext(`${homeHref}?dialog=post-vote`, searchParams)
    : didJoinSecondRound
      ? homeHref
      : "/home";
  const myTeamMvpWinner = firstRoundTeam
    ? (data?.mvpWinners.find(
        (winner) => winner.teamNumber === firstRoundTeam.teamNumber,
      ) ?? null)
    : null;
  const revealOverallResult = useCallback(() => {
    router.replace(overallResultHref, { scroll: false });
  }, [overallResultHref, router]);

  const headerBackHref = showOverallResult
    ? withSessionContext(groupRoutes.voteResult(params.groupId), searchParams)
    : isAdmin
      ? appRoutes.home()
      : footerHomeHref;
  const headerGoesToMainHome = headerBackHref === appRoutes.home();
  const requestMainHomeExit = useCallback(() => {
    setMainHomeExitReason("header");
  }, []);
  const closeMainHomeExitPopup = useCallback(() => {
    setMainHomeExitReason(null);
  }, []);
  const confirmMainHomeExit = useCallback(() => {
    setMainHomeExitReason(null);
    router.replace(appRoutes.home());
  }, [router]);
  const handleFooterHome = useCallback(() => {
    if (footerHomeHref === appRoutes.home()) {
      setMainHomeExitReason("second-round-absent");
      return;
    }

    router.replace(footerHomeHref);
  }, [footerHomeHref, router]);
  const isSecondRoundAbsentExit = mainHomeExitReason === "second-round-absent";

  return (
    <VoteScreenLayout
      title="투표 결과"
      status="CLOSED"
      backHref={headerGoesToMainHome ? undefined : headerBackHref}
      onBack={headerGoesToMainHome ? requestMainHomeExit : undefined}
      testId="vote-result-screen"
      showStatusBadge={false}
      flushContent
    >
      {data && !isTeamLoading && group ? (
        <VoteResultContent
          result={data}
          introMvpWinner={myTeamMvpWinner}
          showOverallResult={showOverallResult}
          onRevealOverallResult={revealOverallResult}
          onHome={handleFooterHome}
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

      <MainHomeExitPopup
        open={mainHomeExitReason !== null}
        onClose={closeMainHomeExitPopup}
        onConfirm={confirmMainHomeExit}
        variant={isSecondRoundAbsentExit ? "first-round-complete" : "default"}
      />
    </VoteScreenLayout>
  );
}
