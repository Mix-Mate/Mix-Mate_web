"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AssignmentProgressIndicator from "@/features/assignment/components/AssignmentProgressIndicator";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";
import styles from "@/features/assignment/components/processing.module.css";

const PROGRESS_STEP_INTERVAL_MS = 150;
const PROGRESS_STEP_MIN = 6;
const PROGRESS_STEP_MAX = 14;
const COMPLETE_DELAY_MS = 400;

export default function AssignmentProcessingScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const round = toAssignmentRound(params.round);
  const { data: group } = useAdminGroupQuery(params.groupId);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepTimer = window.setInterval(() => {
      setProgress((current) => {
        const step =
          PROGRESS_STEP_MIN +
          Math.random() * (PROGRESS_STEP_MAX - PROGRESS_STEP_MIN);
        return Math.min(100, current + step);
      });
    }, PROGRESS_STEP_INTERVAL_MS);

    return () => window.clearInterval(stepTimer);
  }, []);

  useEffect(() => {
    if (progress < 100) return;

    const completeTimer = window.setTimeout(() => {
      router.replace(groupRoutes.adminAssignmentResult(params.groupId, round));
    }, COMPLETE_DELAY_MS);

    return () => window.clearTimeout(completeTimer);
  }, [progress, router, params.groupId, round]);

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
        <AssignmentProgressIndicator progress={progress} />
      </div>
    </MobileFrame>
  );
}
