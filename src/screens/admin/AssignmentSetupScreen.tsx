"use client";

import { useParams, useRouter } from "next/navigation";
import AssignmentSetupForm from "@/features/assignment/components/AssignmentSetupForm";
import { saveAssignmentSetupDraft } from "@/features/assignment/model/assignmentDraft.store";
import type { AssignmentSetupInput } from "@/features/assignment/types/assignment.types";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
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

  const handleSubmit = (input: AssignmentSetupInput) => {
    saveAssignmentSetupDraft(params.groupId, round, input);
    router.push(
      groupRoutes.adminAssignmentFixedMembers(params.groupId, round),
    );
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

      <AssignmentSetupForm round={round} onSubmit={handleSubmit} />
    </MobileFrame>
  );
}
