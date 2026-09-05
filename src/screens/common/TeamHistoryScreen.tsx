"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import TeamHistoryPanel from "@/features/history/components/TeamHistoryPanel";
import { usePreviousTeamQuery } from "@/features/history/hooks/usePreviousTeamQuery";
import type { TeamMember } from "@/features/team/types/team.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";

export default function TeamHistoryScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { data: team, isLoading, error } = usePreviousTeamQuery(params.groupId);
  const canViewPrivateProfiles = group?.myRole === "HOST";

  const handleMemberSelect = (member: TeamMember) => {
    if (member.visibility === "PRIVATE" && !canViewPrivateProfiles) return;

    const profileSearchParams = new URLSearchParams({
      round: "1",
      from: `/groups/${params.groupId}/history`,
    });

    if (canViewPrivateProfiles) {
      profileSearchParams.set("role", "admin");
    }

    router.push(
      withSessionContext(
        `/groups/${params.groupId}/participants/${member.participantId}?${profileSearchParams}`,
        searchParams,
      ),
    );
  };

  return (
    <MobileFrame data-testid="team-history-screen">
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
