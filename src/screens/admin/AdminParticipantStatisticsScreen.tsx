"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import ParticipantStatistics from "@/features/participant/components/ParticipantStatistics";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { getCurrentGroupRound } from "@/features/group/model/group-status";
import { useAdminParticipantListQuery } from "@/features/participant/hooks/useAdminParticipantListQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";
import styles from "./AdminParticipantStatisticsScreen.module.css";

export default function AdminParticipantStatisticsScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const roundParam = searchParams.get("round");
  const round = roundParam
    ? toAssignmentRound(roundParam)
    : group
      ? getCurrentGroupRound(group.status)
      : 1;
  const isRoundResolved = Boolean(roundParam || group);
  const { data } = useAdminParticipantListQuery(params.groupId, round, {
    enabled: isRoundResolved,
    polling: group?.status === "RECRUITING",
  });

  const goToParticipants = () => {
    router.push(
      withSessionContext(
        groupRoutes.adminParticipants(params.groupId, round),
        searchParams,
      ),
    );
  };

  const goToAssignment = () => {
    router.push(
      withSessionContext(
        groupRoutes.adminAssignmentSetup(params.groupId, round),
        searchParams,
      ),
    );
  };

  return (
    <MobileFrame
      data-testid="admin-participant-statistics"
    >
      <Header
        title={group?.groupName ?? data.groupName}
        onBack={() =>
          router.push(
            withSessionContext(
              groupRoutes.adminParticipants(params.groupId, round),
              searchParams,
            ),
          )
        }
      />

      <TabNavigation
        items={[
          { id: "participants", label: "참가자" },
          { id: "statistics", label: "통계" },
          { id: "assignment", label: "조 편성" },
        ]}
        activeItemId="statistics"
        ariaLabel="관리자 메뉴"
        onSelect={(item) => {
          if (item.id === "participants") goToParticipants();
          if (item.id === "assignment") goToAssignment();
        }}
      />

      <main className={styles.content}>
        <ParticipantStatistics participants={data.participants} />
      </main>
    </MobileFrame>
  );
}
