"use client";

import { AlertTriangle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { getMockGroupRole } from "@/features/session/utils/session-navigation";
import AdminVoteEndButton from "@/features/vote/components/status/AdminVoteEndButton";
import VoteCompletionWatcher from "@/features/vote/components/status/VoteCompletionWatcher";
import VoteProgressCard from "@/features/vote/components/status/VoteProgressCard";
import styles from "@/features/vote/components/status/VoteStatus.module.css";
import VoteStatusList from "@/features/vote/components/status/VoteStatusList";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import type { VoteStatusFilter } from "@/features/vote/types/vote.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import VoteScreenLayout from "./VoteScreenLayout";

export default function VoteStatusScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const isAdmin = getMockGroupRole(searchParams) === "ADMIN";
  const { data, isComplete } = useVoteStatusQuery(params.groupId);
  const [selectedFilter, setSelectedFilter] =
    useState<VoteStatusFilter>("PENDING");
  const listContent = {
    ATTEND: {
      title: "2차 참여 명단",
      members: data.attendanceMembers,
      emptyMessage: "2차 참여를 선택한 참가자가 없습니다.",
    },
    ABSENT: {
      title: "불참 명단",
      members: data.absenceMembers,
      emptyMessage: "불참을 선택한 참가자가 없습니다.",
    },
    PENDING: {
      title: "미투표 멤버",
      members: data.pendingMembers,
      emptyMessage: "모든 참가자가 투표를 완료했습니다.",
    },
  }[selectedFilter];
  const showVoteResult = useCallback(() => {
    router.replace(
      withSessionContext(
        `/groups/${params.groupId}/votes/result`,
        searchParams,
      ),
    );
  }, [params.groupId, router, searchParams]);
  const showAdminVoteEnd = useCallback(() => {
    router.push(
      withSessionContext(
        `/groups/${params.groupId}/admin/votes/end`,
        searchParams,
      ),
    );
  }, [params.groupId, router, searchParams]);

  return (
    <VoteScreenLayout
      title="투표 현황"
      status={data.status}
      backHref={`/groups/${params.groupId}/home`}
      testId="vote-status-screen"
    >
      <section
        className={styles.statusScreen}
        data-role={isAdmin ? "ADMIN" : "USER"}
      >
        <VoteProgressCard
          totalCount={data.totalCount}
          completedCount={data.completedCount}
          attendanceCount={data.attendanceCount}
          absenceCount={data.absenceCount}
          pendingCount={data.pendingCount}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />

        <VoteStatusList
          title={listContent.title}
          members={listContent.members}
          emptyMessage={listContent.emptyMessage}
        />

        {!isComplete && (
          <p className={styles.waitingNotice}>
            <AlertTriangle aria-hidden="true" size={17} strokeWidth={2} />
            {isAdmin
              ? "미투표자가 있습니다. 관리자가 수동으로 투표를 종료할 수 있습니다."
              : "미투표자가 있습니다. 투표가 완료되면 결과를 확인할 수 있습니다."}
          </p>
        )}

        {isAdmin && !isComplete && (
          <AdminVoteEndButton onEnd={showAdminVoteEnd} />
        )}

        <VoteCompletionWatcher
          isComplete={isComplete}
          onComplete={showVoteResult}
        />
      </section>
    </VoteScreenLayout>
  );
}
