"use client";

import { useParams, useRouter } from "next/navigation";
import AssignmentProgressIndicator from "@/features/assignment/components/AssignmentProgressIndicator";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";
import styles from "@/features/assignment/components/processing.module.css";

const SKELETON_PROGRESS = 64;

export default function AssignmentProcessingScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const round = toAssignmentRound(params.round);
  const { data: group } = useAdminGroupQuery(params.groupId);

  return (
    <MobileFrame data-testid="assignment-processing-screen" data-round={round}>
      <Header title={group.name} onBack={() => router.back()} />

      <TabNavigation
        items={[
          { id: "participants", label: "참가자" },
          { id: "assignment", label: "조 편성" },
        ]}
        activeItemId="assignment"
        ariaLabel="관리자 메뉴"
        onSelect={(item) => {
          if (item.id === "participants") {
            router.push(groupRoutes.participants(params.groupId));
          }
        }}
      />

      <div className={styles.content}>
        <AssignmentProgressIndicator progress={SKELETON_PROGRESS} />
      </div>
    </MobileFrame>
  );
}
