"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import TeamHistoryPanel from "@/features/history/components/TeamHistoryPanel";
import { usePreviousTeamQuery } from "@/features/history/hooks/usePreviousTeamQuery";
import type { TeamMember } from "@/features/team/types/team.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "@/features/history/components/team-history.module.css";

export default function TeamHistoryScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: team, isLoading, error } = usePreviousTeamQuery(params.groupId);

  const handleMemberSelect = (member: TeamMember) => {
    if (member.visibility === "PRIVATE") return;

    router.push(
      withSessionContext(
        `/groups/${params.groupId}/participants/${member.participantId}`,
        searchParams,
      ),
    );
  };

  return (
    <MobileFrame
      className={styles.phone}
      fillHeight
      data-testid="team-history-screen"
    >
      <Header
        title="이전 조 기록"
        compact
        onBack={() =>
          router.push(
            withSessionContext(groupRoutes.home(params.groupId), searchParams),
          )
        }
        backLabel="사용자 홈으로 이동"
      />

      <TeamHistoryPanel
        team={team}
        isLoading={isLoading}
        error={error}
        onMemberSelect={handleMemberSelect}
      />
    </MobileFrame>
  );
}
