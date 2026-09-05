"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import AssignmentProgressIndicator from "@/features/assignment/components/AssignmentProgressIndicator";
import { useAssignmentStatusQuery } from "@/features/assignment/hooks/useAssignmentStatusQuery";
import { resolveAssignmentRound } from "@/features/assignment/model/assignment-round";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";
import styles from "@/features/assignment/components/processing.module.css";

export default function AssignmentProcessingScreen() {
  const params = useParams<{ groupId: string; round?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const round = resolveAssignmentRound(params.round, group?.status);
  const status = useAssignmentStatusQuery();

  useEffect(() => {
    if (!params.round) return;

    router.replace(
      withSessionContext(
        groupRoutes.adminAssignmentProcessing(params.groupId, round),
        searchParams,
      ),
    );
  }, [params.groupId, params.round, round, router, searchParams]);

  useEffect(() => {
    if (!status.isComplete) return;

    const timer = window.setTimeout(() => {
      router.push(
        withSessionContext(
          groupRoutes.adminAssignmentResult(params.groupId, round),
          searchParams,
        ),
      );
    }, 500);

    return () => window.clearTimeout(timer);
  }, [status.isComplete, router, params.groupId, round, searchParams]);

  if (!group) return null;

  return (
    <MobileFrame data-testid="assignment-processing-screen" data-round={round}>
      <Header
        title={group.groupName}
        onBack={() =>
          router.push(
            withSessionContext(
              round === 2
                ? groupRoutes.adminAssignmentSetup(params.groupId, round)
                : groupRoutes.adminAssignmentFixedMembers(
                    params.groupId,
                    round,
                  ),
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
        activeItemId="assignment"
        ariaLabel="관리자 메뉴"
        onSelect={(item) => {
          if (item.id === "participants") {
            router.push(
              withSessionContext(
                groupRoutes.adminParticipants(params.groupId, round),
                searchParams,
              ),
            );
          }
          if (item.id === "statistics") {
            router.push(
              withSessionContext(
                groupRoutes.adminParticipantStatistics(params.groupId, round),
                searchParams,
              ),
            );
          }
        }}
      />

      <div className={styles.content}>
        <AssignmentProgressIndicator progress={status.progress} />
      </div>
    </MobileFrame>
  );
}
