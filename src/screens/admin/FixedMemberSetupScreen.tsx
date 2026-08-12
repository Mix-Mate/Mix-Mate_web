"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getParticipantPool } from "@/features/assignment/api/assignment.api";
import FixedMemberList from "@/features/assignment/components/FixedMemberList";
import FixedMemberSelector from "@/features/assignment/components/FixedMemberSelector";
import { useCreateAssignmentMutation } from "@/features/assignment/hooks/useCreateAssignmentMutation";
import { useFixedMemberMutation } from "@/features/assignment/hooks/useFixedMemberMutation";
import type { FixedMemberEntry } from "@/features/assignment/types/assignment.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";

export default function FixedMemberSetupScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const round = toAssignmentRound(params.round);
  const participants = getParticipantPool();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const { mutate: saveFixedMembers, isPending: isSavingFixedMembers } =
    useFixedMemberMutation();
  const { mutate: createAssignment, isPending: isCreating } =
    useCreateAssignmentMutation();

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  };

  const fixedMembers: FixedMemberEntry[] = selectedMemberIds.map(
    (memberId) => ({
      memberId,
      memberName:
        participants.find((member) => member.memberId === memberId)
          ?.memberName ?? memberId,
      // TODO(assignment-fixed-group-dialog): AM09SelectFixedGroupDialog 연동 후 실제 선택된 조 번호로 대체한다.
      teamNumber: 1,
    }),
  );

  const handleNext = async () => {
    const saved = await saveFixedMembers(params.groupId, round, fixedMembers);
    if (!saved) return;

    const result = await createAssignment(params.groupId, round);
    if (!result) return;

    router.push(groupRoutes.adminAssignmentProcessing(params.groupId, round));
  };

  return (
    <MobileFrame data-testid="fixed-member-setup-screen" data-round={round}>
      <Header title="고정 멤버 설정" onBack={() => router.back()} />
      <FixedMemberSelector
        members={participants}
        selectedMemberIds={selectedMemberIds}
        onToggle={toggleMember}
      />
      <FixedMemberList fixedMembers={fixedMembers} />
      <Button
        type="button"
        disabled={isSavingFixedMembers || isCreating}
        onClick={handleNext}
      >
        {isSavingFixedMembers || isCreating ? "처리 중..." : "조 편성 시작"}
      </Button>
    </MobileFrame>
  );
}
