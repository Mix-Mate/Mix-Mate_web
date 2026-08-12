"use client";

import { useParams, useRouter } from "next/navigation";
import AssignmentGroupList from "@/features/assignment/components/AssignmentGroupList";
import { useAssignmentResultQuery } from "@/features/assignment/hooks/useAssignmentResultQuery";
import { useConfirmAssignmentMutation } from "@/features/assignment/hooks/useConfirmAssignmentMutation";
import { useRegenerateAssignmentMutation } from "@/features/assignment/hooks/useRegenerateAssignmentMutation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";

export default function AssignmentResultScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const round = toAssignmentRound(params.round);
  const { data: result } = useAssignmentResultQuery(params.groupId, round);
  const { mutate: regenerate, isPending: isRegenerating } =
    useRegenerateAssignmentMutation();
  const { mutate: confirmAssignment, isPending: isConfirming } =
    useConfirmAssignmentMutation();

  const handleConfirm = async () => {
    const confirmed = await confirmAssignment(params.groupId, round);
    if (!confirmed) return;

    router.push(groupRoutes.adminProgress(params.groupId));
  };

  return (
    <MobileFrame data-testid="assignment-result-screen" data-round={round}>
      <Header title="조 편성 결과" onBack={() => router.back()} />

      {result ? (
        <AssignmentGroupList teams={result.teams} />
      ) : (
        <p>편성 결과를 불러오는 중입니다.</p>
      )}

      <Button
        type="button"
        variant="secondary"
        disabled={isRegenerating}
        onClick={() => regenerate(params.groupId, round)}
      >
        {isRegenerating ? "재배치 중..." : "재셔플"}
      </Button>
      <Button type="button" disabled={isConfirming} onClick={handleConfirm}>
        {isConfirming ? "확정 중..." : "결과 확정"}
      </Button>
    </MobileFrame>
  );
}
