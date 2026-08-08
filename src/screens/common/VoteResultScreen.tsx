"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import VoteResultContent from "@/features/vote/components/result/VoteResultContent";
import { useVoteResultQuery } from "@/features/vote/hooks/useVoteResultQuery";
import VoteScreenLayout from "./VoteScreenLayout";

export default function VoteResultScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data } = useVoteResultQuery(params.groupId);
  const homeHref = `/groups/${params.groupId}/home`;

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
        onHome={() =>
          router.push(withSessionContext(homeHref, searchParams))
        }
      />
    </VoteScreenLayout>
  );
}
