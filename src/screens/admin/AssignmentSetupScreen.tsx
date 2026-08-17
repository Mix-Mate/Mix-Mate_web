"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getParticipantPool } from "@/features/assignment/api/assignment.api";
import AssignmentSetupForm from "@/features/assignment/components/AssignmentSetupForm";
import {
  assignTeams,
  evaluateAssignmentWarnings,
} from "@/features/assignment/model/assignment.rules";
import {
  saveAssignmentResultDraft,
  saveAssignmentSetupDraft,
} from "@/features/assignment/model/assignmentDraft.store";
import type { AssignmentSetupInput } from "@/features/assignment/types/assignment.types";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import AssignmentWarningDialog from "@/modals/admin/AssignmentWarningDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";

export default function AssignmentSetupScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const round = toAssignmentRound(params.round);
  const { data: group } = useAdminGroupQuery(params.groupId);
  const [warningMessages, setWarningMessages] = useState<string[] | null>(
    null,
  );

  const goToProcessing = () => {
    router.push(groupRoutes.adminAssignmentProcessing(params.groupId, round));
  };

  const handleSubmit = (input: AssignmentSetupInput) => {
    saveAssignmentSetupDraft(params.groupId, round, input);

    if (round !== 2) {
      router.push(
        groupRoutes.adminAssignmentFixedMembers(params.groupId, round),
      );
      return;
    }

    const teams = assignTeams(getParticipantPool(), input.groupCount);
    const warnings = evaluateAssignmentWarnings(teams, input.conditionKeys);

    saveAssignmentResultDraft(params.groupId, round, teams);

    if (warnings.length > 0) {
      setWarningMessages(warnings.map((warning) => warning.message));
      return;
    }

    goToProcessing();
  };

  return (
    <MobileFrame data-testid="assignment-setup-screen" data-round={round}>
      <Header title={group.name} onBack={() => router.back()} />

      <TabNavigation
        items={[
          { id: "participants", label: "참가자", disabled: true },
          { id: "assignment", label: "조 편성" },
        ]}
        activeItemId="assignment"
        ariaLabel="관리자 메뉴"
        onSelect={() => {}}
      />

      <AssignmentSetupForm
        groupId={params.groupId}
        round={round}
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
