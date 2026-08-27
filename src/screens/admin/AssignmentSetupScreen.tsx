"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import AssignmentSetupForm from "@/features/assignment/components/AssignmentSetupForm";
import { useCreateAssignmentMutation } from "@/features/assignment/hooks/useCreateAssignmentMutation";
import { toBackendConditions } from "@/features/assignment/model/assignment.mapper";
import {
  saveAssignmentResultDraft,
  saveAssignmentSetupDraft,
} from "@/features/assignment/model/assignmentDraft.store";
import type { AssignmentSetupInput } from "@/features/assignment/types/assignment.types";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import AssignmentWarningDialog from "@/modals/admin/AssignmentWarningDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";

export default function AssignmentSetupScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const round = toAssignmentRound(params.round);
  const { data: group } = useAdminGroupQuery(params.groupId);
  const [warningMessages, setWarningMessages] = useState<string[] | null>(
    null,
  );
  const {
    mutate: createAssignment,
    isPending: isAssigning,
    error: assignError,
  } = useCreateAssignmentMutation();

  const goToProcessing = () => {
    router.push(
      withSessionContext(
        groupRoutes.adminAssignmentProcessing(params.groupId, round),
        searchParams,
      ),
    );
  };

  const handleSubmit = async (input: AssignmentSetupInput) => {
    saveAssignmentSetupDraft(params.groupId, round, input);

    if (round !== 2) {
      router.push(
        withSessionContext(
          groupRoutes.adminAssignmentFixedMembers(params.groupId, round),
          searchParams,
        ),
      );
      return;
    }

    // 2차는 1차 조 편성 결과를 고정 멤버로 넘기지 않는다.
    // (조 개수/대상 참가자가 회차마다 달라져 백엔드 검증과 계속 어긋났음)
    const result = await createAssignment(params.groupId, round, {
      teamCount: input.groupCount,
      conditions: toBackendConditions(input.conditionKeys),
      fixedMembers: [],
    });

    if (!result) return;

    saveAssignmentResultDraft(params.groupId, round, result.teams);

    if (result.warnings.length > 0) {
      setWarningMessages(result.warnings);
      return;
    }

    goToProcessing();
  };

  if (!group) return null;

  return (
    <MobileFrame data-testid="assignment-setup-screen" data-round={round}>
      <Header title={group.groupName} onBack={() => router.back()} />

      <TabNavigation
        items={[
          { id: "participants", label: "참가자" },
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
        }}
      />

      <AssignmentSetupForm
        groupId={params.groupId}
        round={round}
        isSubmitting={isAssigning}
        errorMessage={assignError}
        onSubmit={handleSubmit}
      />

      <AssignmentWarningDialog
        open={warningMessages !== null}
        warnings={warningMessages ?? []}
        onClose={() => setWarningMessages(null)}
        onReset={() => setWarningMessages(null)}
        onConfirm={goToProcessing}
      />
    </MobileFrame>
  );
}
