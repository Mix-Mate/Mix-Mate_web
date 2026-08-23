"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getMockGroupRole,
  withSessionContext,
} from "@/features/session/utils/session-navigation";
import VoteResultContent from "@/features/vote/components/result/VoteResultContent";
import styles from "@/features/vote/components/result/VoteResult.module.css";
import { useVoteResultQuery } from "@/features/vote/hooks/useVoteResultQuery";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import VoteScreenLayout from "./VoteScreenLayout";

export default function VoteResultScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useVoteResultQuery(params.groupId);
  const isAdmin = getMockGroupRole(searchParams) === "ADMIN";
  const homeHref = groupRoutes.home(params.groupId);
  const resultHomeHref = isAdmin
    ? withSessionContext(`${homeHref}?dialog=post-vote`, searchParams)
    : `${homeHref}?scenario=round2-waiting&role=user`;

  return (
    <VoteScreenLayout
      title="투표 결과"
      status="CLOSED"
      backHref={homeHref}
      testId="vote-result-screen"
      showStatusBadge={false}
      flushContent
    >
      {data ? (
        <VoteResultContent
          result={data}
          onHome={() => router.replace(resultHomeHref)}
        />
      ) : (
        <section className={styles.resultQueryScreen}>
          <p
            className={`${styles.resultQueryState} ${
              error ? styles.resultQueryError : ""
            }`}
            role={error ? "alert" : "status"}
          >
            {error ??
              (isLoading
                ? "투표 결과를 불러오는 중입니다."
                : "투표 결과를 불러오지 못했습니다.")}
          </p>
        </section>
      )}
    </VoteScreenLayout>
  );
}
