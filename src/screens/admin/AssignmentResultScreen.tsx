"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AssignmentGroupList from "@/features/assignment/components/AssignmentGroupList";
import { assignTeams } from "@/features/assignment/model/assignment.rules";
import {
  clearAssignmentResultDraft,
  getAssignmentResultDraft,
  saveAssignmentResultDraft,
} from "@/features/assignment/model/assignmentDraft.store";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
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
  const round = toAssignmentRound(params.round);
  const { data: group } = useAdminGroupQuery(params.groupId);

  const [result] = useState(() =>
    getAssignmentResultDraft(params.groupId, round),
  );

  const handleReshuffle = () => {
    if (!result) return;

    const candidates = result.flatMap((team) => team.members);
    const reshuffled = assignTeams(candidates, result.length);
    saveAssignmentResultDraft(params.groupId, round, reshuffled);
    router.push(groupRoutes.adminAssignmentProcessing(params.groupId, round));
  };

  const handleConfirm = () => {
    clearAssignmentResultDraft(params.groupId, round);
    router.push(groupRoutes.home(params.groupId));
  };

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
      data-testid="assignment-result-screen"
      data-round={round}
    >
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
        <h2 className={styles.heading}>조 편성 결과</h2>

        {result ? (
          <AssignmentGroupList teams={result} />
        ) : (
          <p className={styles.emptyState}>
            표시할 편성 결과가 없어요. 이미 확정되었거나, 아직 편성이 실행되지
            않았을 수 있어요.
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <Button
          variant="secondary"
          type="button"
          disabled={!result}
          onClick={handleReshuffle}
        >
          재셔플
        </Button>
        <Button type="button" disabled={!result} onClick={handleConfirm}>
          결과 확정하기
        </Button>
      </div>
    </MobileFrame>
  );
}
