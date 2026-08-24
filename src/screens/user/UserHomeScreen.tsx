"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDecideSecondRoundMutation } from "@/features/group/hooks/useDecideSecondRoundMutation";
import { useFinishGroupMutation } from "@/features/group/hooks/useFinishGroupMutation";
import {
  canFinishGroup,
  getCurrentGroupRound,
  toEventStatus,
} from "@/features/group/model/group-status";
import UserSessionContent from "@/features/session/components/UserSessionContent";
import { useEndRoundMutation } from "@/features/session/hooks/useEndRoundMutation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import type { GroupRole } from "@/features/session/types/session.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import type { TeamRound } from "@/features/team/types/team.types";
import EndRoundDialog from "@/modals/admin/EndRoundDialog";
import PostVoteDecisionDialog from "@/modals/admin/PostVoteDecisionDialog";
import UM01LeaveGroupDialog from "@/modals/user/LeaveGroupDialog";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./UserHomeScreen.module.css";

export default function UserHomeScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group, refetch: refetchGroup } = useAdminGroupQuery(
    params.groupId,
  );
  const isAdmin = group?.myRole === "HOST";
  const groupRole: GroupRole = isAdmin ? "ADMIN" : "USER";
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
    groupRole,
  );
  const sessionSnapshot = {
    ...snapshot,
    groupName: group?.groupName ?? snapshot.groupName,
    role: groupRole,
    roleLabel: isAdmin ? "관리자" : "사용자",
    round: group ? getCurrentGroupRound(group.status) : snapshot.round,
    currentStatus: group ? toEventStatus(group.status) : snapshot.currentStatus,
    permissions: {
      ...snapshot.permissions,
      canEndRound:
        isAdmin &&
        (group?.status === "FIRST_ROUND" || group?.status === "SECOND_ROUND"),
    },
  };
  const teamRound: TeamRound =
    sessionSnapshot.round === 2 ? "SECOND_ROUND" : "FIRST_ROUND";
  const {
    data: myTeam,
    isLoading: isTeamLoading,
    error: teamError,
  } = useMyTeamQuery(params.groupId, teamRound);
  const {
    mutate: endRound,
    isPending: isEndingMockRound,
    error: endRoundError,
  } = useEndRoundMutation();
  const {
    mutate: decideSecondRound,
    isPending: isDecidingSecondRound,
    error: decideSecondRoundError,
  } = useDecideSecondRoundMutation();
  const {
    mutate: requestFinishGroup,
    isPending: isFinishGroupPending,
    error: finishGroupError,
  } = useFinishGroupMutation();
  const finishFlowInFlightRef = useRef(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [endRoundDialogOpen, setEndRoundDialogOpen] = useState(false);
  const [leaveCompleted, setLeaveCompleted] = useState(false);
  const [isRefreshingSecondRound, setIsRefreshingSecondRound] = useState(false);
  const [secondRoundStatusError, setSecondRoundStatusError] = useState<
    string | null
  >(null);
  const [isRefreshingFinishedGroup, setIsRefreshingFinishedGroup] =
    useState(false);
  const [finishStatusError, setFinishStatusError] = useState<string | null>(
    null,
  );
  const canDecideSecondRound =
    isAdmin && group?.status === "VOTE_CLOSED";
  const isSecondRoundDecisionPending =
    isDecidingSecondRound || isRefreshingSecondRound;
  const secondRoundDecisionError =
    secondRoundStatusError ?? decideSecondRoundError;
  const isFinishingGroup =
    isFinishGroupPending || isRefreshingFinishedGroup;
  const isEndingRound = isEndingMockRound || isFinishingGroup;
  const finalRoundError = finishStatusError ?? finishGroupError;
  const isFinalRound = sessionSnapshot.round === 2;
  const postVoteDialogOpen =
    canDecideSecondRound && searchParams.get("dialog") === "post-vote";

  const closeLeaveDialog = useCallback(() => {
    setLeaveDialogOpen(false);
  }, []);

  const confirmLeave = useCallback(() => {
    setLeaveDialogOpen(false);
    setLeaveCompleted(true);
  }, []);

  const closeEndRoundDialog = useCallback(() => {
    if (!isEndingRound) setEndRoundDialogOpen(false);
  }, [isEndingRound]);

  const finishGroup = useCallback(async () => {
    if (
      !group ||
      group.myRole !== "HOST" ||
      !canFinishGroup(group.status) ||
      isFinishingGroup ||
      finishFlowInFlightRef.current
    ) {
      return;
    }

    finishFlowInFlightRef.current = true;
    setFinishStatusError(null);

    try {
      const didFinish = await requestFinishGroup(params.groupId);
      if (!didFinish) return;

      setIsRefreshingFinishedGroup(true);

      const refreshedGroup = await refetchGroup();

      if (!refreshedGroup) {
        setFinishStatusError("그룹 상태를 다시 확인하지 못했습니다.");
        return;
      }

      if (refreshedGroup.status !== "FINISHED") {
        setFinishStatusError("모임 종료 상태를 확인하지 못했습니다.");
        return;
      }

      setEndRoundDialogOpen(false);
      router.replace(
        withSessionContext(groupRoutes.completed(params.groupId), searchParams),
      );
    } finally {
      finishFlowInFlightRef.current = false;
      setIsRefreshingFinishedGroup(false);
    }
  }, [
    group,
    isFinishingGroup,
    params.groupId,
    refetchGroup,
    requestFinishGroup,
    router,
    searchParams,
  ]);

  const confirmEndRound = useCallback(async () => {
    if (isFinalRound) {
      await finishGroup();
      return;
    }

    const result = await endRound(params.groupId, sessionSnapshot.round);
    if (!result) return;

    setEndRoundDialogOpen(false);

    if (result.nextStatus === "VOTING") {
      router.replace(
        withSessionContext(groupRoutes.mvpVote(params.groupId), searchParams),
      );
      return;
    }

    router.replace(
      withSessionContext(groupRoutes.completed(params.groupId), searchParams),
    );
  }, [
    endRound,
    finishGroup,
    isFinalRound,
    params.groupId,
    router,
    searchParams,
    sessionSnapshot.round,
  ]);

  const continueToRoundTwo = useCallback(async () => {
    if (
      !canDecideSecondRound ||
      isSecondRoundDecisionPending ||
      isFinishingGroup
    ) {
      return;
    }

    setSecondRoundStatusError(null);

    const didDecide = await decideSecondRound(params.groupId);
    if (!didDecide) return;

    setIsRefreshingSecondRound(true);

    try {
      const refreshedGroup = await refetchGroup();

      if (!refreshedGroup) {
        setSecondRoundStatusError("그룹 상태를 다시 확인하지 못했습니다.");
        return;
      }

      if (refreshedGroup.status !== "BEFORE_SECOND_ROUND") {
        setSecondRoundStatusError("2차 준비 상태를 확인하지 못했습니다.");
        return;
      }

      router.replace(groupRoutes.adminPreparation(params.groupId));
    } finally {
      setIsRefreshingSecondRound(false);
    }
  }, [
    canDecideSecondRound,
    decideSecondRound,
    isFinishingGroup,
    isSecondRoundDecisionPending,
    params.groupId,
    refetchGroup,
    router,
  ]);

  return (
    <MobileFrame
      data-testid="user-home"
      data-scenario={sessionSnapshot.scenario}
      data-role={sessionSnapshot.role}
    >
      <Header title={sessionSnapshot.groupName} onBack={() => router.back()} />

      <UserSessionContent
        groupId={params.groupId}
        snapshot={sessionSnapshot}
        teamNumber={myTeam?.teamNumber ?? null}
        isTeamLoading={isTeamLoading}
        teamError={teamError}
        onNavigate={(href) =>
          router.push(withSessionContext(href, searchParams))
        }
        onRequestLeave={() => setLeaveDialogOpen(true)}
        onRequestEndRound={() => setEndRoundDialogOpen(true)}
      />

      {leaveCompleted && (
        <Toast className={styles.toast}>
          Mock 환경에서 그룹 탈퇴가 처리됐습니다.
        </Toast>
      )}

      {finalRoundError && (
        <Toast className={styles.toast} role="alert">
          {finalRoundError}
        </Toast>
      )}

      <UM01LeaveGroupDialog
        open={leaveDialogOpen}
        onClose={closeLeaveDialog}
        onConfirm={confirmLeave}
      />

      <EndRoundDialog
        open={endRoundDialogOpen}
        round={sessionSnapshot.round}
        isEnding={isEndingRound}
        error={isFinalRound ? finalRoundError : endRoundError}
        onClose={closeEndRoundDialog}
        onConfirm={confirmEndRound}
      />

      <PostVoteDecisionDialog
        open={postVoteDialogOpen}
        isContinuing={isSecondRoundDecisionPending}
        continueError={secondRoundDecisionError}
        isFinishing={isFinishingGroup}
        onContinue={continueToRoundTwo}
        onFinish={finishGroup}
      />
    </MobileFrame>
  );
}
