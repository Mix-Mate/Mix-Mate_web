"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import TeamHistoryPanel from "@/features/history/components/TeamHistoryPanel";
import { usePreviousTeamQuery } from "@/features/history/hooks/usePreviousTeamQuery";
import type { TeamMemberSummary } from "@/features/team/types/team.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";

export default function TeamHistoryScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: team } = usePreviousTeamQuery(params.groupId);

  const handleMemberSelect = (member: TeamMemberSummary) => {
    if (member.profileVisibility === "PRIVATE") return;

    // TODO(profile-integration): 공개 프로필 페이지가 연결되면 member.id로 이동한다.
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

      <TeamHistoryPanel team={team} onMemberSelect={handleMemberSelect} />
    </MobileFrame>
  );
}
