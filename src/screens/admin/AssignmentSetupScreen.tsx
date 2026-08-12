"use client";

import { useParams, useRouter } from "next/navigation";
import AssignmentSetupForm from "@/features/assignment/components/AssignmentSetupForm";
import { saveAssignmentSetupDraft } from "@/features/assignment/model/assignmentDraft.store";
import type { AssignmentSetupInput } from "@/features/assignment/types/assignment.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";

export default function AssignmentSetupScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const round = toAssignmentRound(params.round);

  const handleSubmit = (input: AssignmentSetupInput) => {
    saveAssignmentSetupDraft(params.groupId, round, input);
    router.push(
      groupRoutes.adminAssignmentFixedMembers(params.groupId, round),
    );
  };

  return (
    <MobileFrame data-testid="assignment-setup-screen" data-round={round}>
      <Header
        title={round === 1 ? "1차 조 편성 설정" : "2차 조 편성 설정"}
        onBack={() => router.back()}
      />
      <AssignmentSetupForm round={round} onSubmit={handleSubmit} />
    </MobileFrame>
  );
}
