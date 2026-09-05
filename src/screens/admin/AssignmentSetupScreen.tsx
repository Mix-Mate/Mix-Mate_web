"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AssignmentSetupForm from "@/features/assignment/components/AssignmentSetupForm";
import { useCreateAssignmentMutation } from "@/features/assignment/hooks/useCreateAssignmentMutation";
import { resolveAssignmentRound } from "@/features/assignment/model/assignment-round";
import { toBackendConditions } from "@/features/assignment/model/assignment.mapper";
import {
  saveAssignmentResultDraft,
  saveAssignmentSetupDraft,
} from "@/features/assignment/model/assignmentDraft.store";
import type { AssignmentSetupInput } from "@/features/assignment/types/assignment.types";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import GroupHomeHeader from "@/features/session/components/GroupHomeHeader";
import AssignmentWarningDialog from "@/modals/admin/AssignmentWarningDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";

export default function AssignmentSetupScreen() {
  const params = useParams<{ groupId: string; round?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const round = resolveAssignmentRound(params.round, group?.status);
  const [warningMessages, setWarningMessages] = useState<string[] | null>(null);
  const {
    mutate: createAssignment,
    isPending: isAssigning,
    error: assignError,
  } = useCreateAssignmentMutation();

  useEffect(() => {
    if (!params.round) return;

    router.replace(
      withSessionContext(
        groupRoutes.adminAssignmentSetup(params.groupId, round),
        searchParams,
      ),
    );
  }, [params.groupId, params.round, round, router, searchParams]);

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
      <GroupHomeHeader title={group.groupName} />

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
