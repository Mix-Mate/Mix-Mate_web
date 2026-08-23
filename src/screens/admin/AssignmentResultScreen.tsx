"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import AssignmentGroupList from "@/features/assignment/components/AssignmentGroupList";
import { useConfirmAssignmentMutation } from "@/features/assignment/hooks/useConfirmAssignmentMutation";
import { useCreateAssignmentMutation } from "@/features/assignment/hooks/useCreateAssignmentMutation";
import {
  toBackendConditions,
  toFixedMembersFromTeams,
} from "@/features/assignment/model/assignment.mapper";
import {
  clearAssignmentResultDraft,
  getAssignmentResultDraft,
  getAssignmentSetupDraft,
  saveAssignmentResultDraft,
} from "@/features/assignment/model/assignmentDraft.store";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import TabNavigation from "@/shared/ui/TabNavigation";
import styles from "./assignment-result.module.css";

export default function AssignmentResultScreen() {
  const params = useParams<{ groupId: string; round: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const round = toAssignmentRound(params.round);
  const { data: group } = useAdminGroupQuery(params.groupId);

  const [result, setResult] = useState(() =>
    getAssignmentResultDraft(params.groupId, round),
  );

  const {
    mutate: createAssignment,
    isPending: isReshuffling,
    error: reshuffleError,
  } = useCreateAssignmentMutation();
  const {
    mutate: confirmAssignment,
    isPending: isConfirming,
    error: confirmError,
  } = useConfirmAssignmentMutation();

  const handleReshuffle = async () => {
    if (!result) return;

    const setupDraft = getAssignmentSetupDraft(params.groupId, round);
    const fixedOnly = result.map((team) => ({
      ...team,
      members: team.members.filter((member) => member.fixed),
    }));

    const response = await createAssignment(params.groupId, round, {
      teamCount: result.length,
      conditions: toBackendConditions(setupDraft?.conditionKeys ?? []),
      fixedMembers: toFixedMembersFromTeams(fixedOnly),
    });

    if (!response) return;

    saveAssignmentResultDraft(params.groupId, round, response.teams);
    setResult(response.teams);
    router.push(
      withSessionContext(
        groupRoutes.adminAssignmentProcessing(params.groupId, round),
        searchParams,
      ),
    );
  };

  const handleConfirm = async () => {
    const confirmed = await confirmAssignment(params.groupId, round);
    if (!confirmed) return;

    clearAssignmentResultDraft(params.groupId, round);
    const scenario = round === 2 ? "round2-active" : "round1-active";
    router.push(`${groupRoutes.home(params.groupId)}?scenario=${scenario}`);
  };

  const isBusy = isReshuffling || isConfirming;

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="assignment-result-screen"
      data-round={round}
    >
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

      <div className={styles.content}>
        <h2 className={styles.heading}>조 편성 결과</h2>

        {result ? (
          <AssignmentGroupList teams={result} />
        ) : (
          <p className={styles.emptyState}>
            표시할 편성 결과가 없어요. 이미 확정되었거나, 아직 편성이 실행되지
            않았을 수 있어요.
          </p>
        )}

        {(reshuffleError || confirmError) && (
          <p className={styles.errorText}>{reshuffleError ?? confirmError}</p>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="secondary"
          type="button"
          disabled={!result || isBusy}
          onClick={handleReshuffle}
        >
          {isReshuffling ? "재셔플 중..." : "재셔플"}
        </Button>
        <Button
          type="button"
          disabled={!result || isBusy}
          onClick={handleConfirm}
        >
          {isConfirming ? "확정 중..." : "결과 확정하기"}
        </Button>
      </div>
    </MobileFrame>
  );
}
