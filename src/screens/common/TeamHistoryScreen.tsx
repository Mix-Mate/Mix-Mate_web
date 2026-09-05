"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import TeamHistoryPanel from "@/features/history/components/TeamHistoryPanel";
import { usePreviousTeamQuery } from "@/features/history/hooks/usePreviousTeamQuery";
import PrivateParticipantDialog from "@/features/participant/components/PrivateParticipantDialog";
import type { Participant } from "@/features/participant/types/participant.types";
import type { TeamMember } from "@/features/team/types/team.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";

export default function TeamHistoryScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const [privateParticipant, setPrivateParticipant] =
    useState<Participant | null>(null);
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { data: team, isLoading, error } = usePreviousTeamQuery(params.groupId);
  const canViewPrivateProfiles = group?.myRole === "HOST";
  const myParticipantId = group?.myParticipantId
    ? String(group.myParticipantId)
    : null;

  const handleMemberSelect = (member: TeamMember) => {
    const selectedParticipantId = String(member.participantId);
    const isMyProfile =
      myParticipantId !== null && myParticipantId === selectedParticipantId;

    if (isMyProfile) {
      router.push(
        withSessionContext(groupRoutes.profile(params.groupId), searchParams),
      );
      return;
    }

    if (
      member.visibility === "PRIVATE" &&
      !canViewPrivateProfiles &&
      !isMyProfile
    ) {
      setPrivateParticipant({
        id: selectedParticipantId,
        name: member.displayName,
        department: member.major,
        visibility: "private",
        role: "general",
        gender: member.gender === "FEMALE" ? "female" : "male",
      });
      return;
    }

    const profileSearchParams = new URLSearchParams({
      round: "1",
      from: `/groups/${params.groupId}/history`,
    });

    router.push(
      withSessionContext(
        `/groups/${params.groupId}/participants/${selectedParticipantId}?${profileSearchParams}`,
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

      <PrivateParticipantDialog
        participant={privateParticipant}
        onClose={() => setPrivateParticipant(null)}
      />
    </MobileFrame>
  );
}
