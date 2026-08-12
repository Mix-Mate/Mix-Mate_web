"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import AssignmentProgress from "@/features/assignment/components/AssignmentProgress";
import { useAssignmentStatusQuery } from "@/features/assignment/hooks/useAssignmentStatusQuery";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";

export default function AssignmentProcessingScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const round = toAssignmentRound(params.round);
  const { data: status, isComplete } = useAssignmentStatusQuery(
    params.groupId,
    round,
  );

  useEffect(() => {
    if (!isComplete) return;
    router.replace(groupRoutes.adminAssignmentResult(params.groupId, round));
  }, [isComplete, params.groupId, round, router]);

  return (
    <MobileFrame
      data-testid="assignment-processing-screen"
      data-round={round}
    >
      <Header title="조 편성 진행 중" onBack={() => router.back()} />
      <AssignmentProgress status={status} />
    </MobileFrame>
  );
}
