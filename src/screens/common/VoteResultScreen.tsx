"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getMockGroupRole,
  withSessionContext,
} from "@/features/session/utils/session-navigation";
import VoteResultContent from "@/features/vote/components/result/VoteResultContent";
import { useVoteResultQuery } from "@/features/vote/hooks/useVoteResultQuery";
import VoteScreenLayout from "./VoteScreenLayout";

export default function VoteResultScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data } = useVoteResultQuery(params.groupId);
  const isAdmin = getMockGroupRole(searchParams) === "ADMIN";
  const homeHref = `/groups/${params.groupId}/home`;
  const resultHomeHref = isAdmin
    ? withSessionContext(`${homeHref}?dialog=post-vote`, searchParams)
    : `${homeHref}?scenario=round2-waiting&role=user`;

  return (
    <VoteScreenLayout
      title="투표 결과"
      status={data.status}
      backHref={homeHref}
      testId="vote-result-screen"
      showStatusBadge={false}
      flushContent
    >
      <VoteResultContent
        result={data}
        onHome={() => router.replace(resultHomeHref)}
      />
    </VoteScreenLayout>
  );
}
