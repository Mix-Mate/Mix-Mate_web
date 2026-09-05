"use client";

import { Clock3 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDecideSecondRoundMutation } from "@/features/group/hooks/useDecideSecondRoundMutation";
import { useFinishFirstRoundMutation } from "@/features/group/hooks/useFinishFirstRoundMutation";
import { useFinishGroupMutation } from "@/features/group/hooks/useFinishGroupMutation";
import { useLeaveGroupMutation } from "@/features/group/hooks/useLeaveGroupMutation";
import {
  canFinishGroup,
  getGroupStatusLabel,
} from "@/features/group/model/group-status";
import UserSessionContent from "@/features/session/components/UserSessionContent";
import GroupHomeHeader from "@/features/session/components/GroupHomeHeader";
import {
  createGroupHomeSnapshot,
  hasAssignedTeam,
} from "@/features/session/model/group-session";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import { useMyTeamQuery } from "@/features/team/hooks/useMyTeamQuery";
import type { TeamRound } from "@/features/team/types/team.types";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
import EndRoundDialog from "@/modals/admin/EndRoundDialog";
import PostVoteDecisionDialog from "@/modals/admin/PostVoteDecisionDialog";
import UM01LeaveGroupDialog from "@/modals/user/LeaveGroupDialog";
import AdminPreparationScreen from "@/screens/admin/AdminPreparationScreen";
import AdminRecruitmentScreen from "@/screens/admin/AdminRecruitmentScreen";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import {
  removeBlockedGroup,
  removeKnownGroupName,
} from "@/features/blacklist/lib/blockedGroupsStorage";
import styles from "./UserHomeScreen.module.css";

export default function UserHomeScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: group, refetch: refetchGroup } = useAdminGroupQuery(
    params.groupId,
  );
  const snapshot = useMemo(
    () => (group ? createGroupHomeSnapshot(group) : null),
    [group],
  );
  const shouldCheckSecondRoundAttendance =
    group?.myRole === "PARTICIPANT" &&
    (group.status === "VOTE_CLOSED" ||
      group.status === "BEFORE_SECOND_ROUND" ||
      group.status === "SECOND_ROUND");
  const {
    data: voteStatus,
    isLoading: isVoteStatusLoading,
    error: voteStatusError,
  } = useVoteStatusQuery(params.groupId, {
    enabled: shouldCheckSecondRoundAttendance,
    pollingEnabled: false,
  });
  const currentParticipantChoice = voteStatus?.participants.find(
    (participant) => participant.participantId === group?.myParticipantId,
  )?.choice;
  const isSecondRoundAbsent =
    shouldCheckSecondRoundAttendance &&
    currentParticipantChoice === "NOT_PARTICIPATE";
  const isCheckingSecondRoundAttendance =
    shouldCheckSecondRoundAttendance && isVoteStatusLoading;
  const shouldLoadMyTeam =
    group !== null &&
    snapshot !== null &&
    hasAssignedTeam(group.status) &&
    snapshot.scenario !== "round2-waiting" &&
    !isCheckingSecondRoundAttendance &&
    !isSecondRoundAbsent;
  const teamRound: TeamRound =
    snapshot?.round === 2 ? "SECOND_ROUND" : "FIRST_ROUND";
  const {
    data: myTeam,
    isLoading: isTeamLoading,
    error: teamError,
  } = useMyTeamQuery(params.groupId, teamRound, shouldLoadMyTeam);
  const {
    mutate: finishFirstRound,
    isPending: isFinishingFirstRound,
    error: finishFirstRoundError,
  } = useFinishFirstRoundMutation();
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
  const {
    mutate: leaveGroup,
    isPending: isLeavingGroup,
    error: leaveGroupError,
  } = useLeaveGroupMutation();
  const finishFlowInFlightRef = useRef(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [endRoundDialogOpen, setEndRoundDialogOpen] = useState(false);
  const [isRefreshingSecondRound, setIsRefreshingSecondRound] = useState(false);
  const [secondRoundStatusError, setSecondRoundStatusError] = useState<
    string | null
  >(null);
  const [isRefreshingFinishedGroup, setIsRefreshingFinishedGroup] =
    useState(false);
  const [finishStatusError, setFinishStatusError] = useState<string | null>(
    null,
  );
  const isAdmin = group?.myRole === "HOST";
  const shouldShowAdminPreparation =
    isAdmin &&
    (group?.status === "BEFORE_FIRST_ROUND" ||
      group?.status === "BEFORE_SECOND_ROUND");
  const canDecideSecondRound = isAdmin && group?.status === "VOTE_CLOSED";
  const isSecondRoundDecisionPending =
    isDecidingSecondRound || isRefreshingSecondRound;
  const secondRoundDecisionError =
    secondRoundStatusError ?? decideSecondRoundError;
  const isFinishingGroup = isFinishGroupPending || isRefreshingFinishedGroup;
  const finalRoundError = finishStatusError ?? finishGroupError;
  const isEndingRound = isFinishingFirstRound || isFinishingGroup;
  const endRoundError =
    snapshot?.round === 1 ? finishFirstRoundError : finalRoundError;
  const canLeaveGroup = snapshot?.permissions.canLeaveGroup ?? false;
  const scenarioParam = searchParams.get("scenario");
  const roleParam = searchParams.get("role");
  const postVoteDialogOpen =
    canDecideSecondRound && searchParams.get("dialog") === "post-vote";

  useEffect(() => {
    if (!scenarioParam && !roleParam) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("scenario");
    nextSearchParams.delete("role");

    const nextQuery = nextSearchParams.toString();
    router.replace(
      `${groupRoutes.home(params.groupId)}${nextQuery ? `?${nextQuery}` : ""}`,
      { scroll: false },
    );
  }, [params.groupId, roleParam, router, scenarioParam, searchParams]);

  useEffect(() => {
    if (!group) return;

    if (group.status === "FINISHED") {
      router.replace(groupRoutes.completed(params.groupId));
    }
  }, [group, params.groupId, router]);

  const closeLeaveDialog = useCallback(() => {
    if (!isLeavingGroup) setLeaveDialogOpen(false);
  }, [isLeavingGroup]);

  const confirmLeave = useCallback(async () => {
    if (!canLeaveGroup) return;

    const left = await leaveGroup(params.groupId);
    if (!left) return;

    removeKnownGroupName(params.groupId);
    removeBlockedGroup(params.groupId);

    setLeaveDialogOpen(false);
    router.replace("/home");
  }, [canLeaveGroup, leaveGroup, params.groupId, router]);

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
    if (!snapshot) return;

    if (snapshot.round === 1) {
      const didFinish = await finishFirstRound(params.groupId);
      if (!didFinish) return;

      setEndRoundDialogOpen(false);
      router.replace(
        withSessionContext(groupRoutes.mvpVote(params.groupId), searchParams),
      );
      return;
    }

    await finishGroup();
  }, [
    finishFirstRound,
    finishGroup,
    params.groupId,
    router,
    searchParams,
    snapshot,
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

  if (!group || !snapshot || group.status === "FINISHED") {
    return null;
  }

  if (isAdmin && group.status === "RECRUITING") {
    return <AdminRecruitmentScreen />;
  }

  if (shouldShowAdminPreparation) {
    return <AdminPreparationScreen />;
  }

  if (isCheckingSecondRoundAttendance) {
    return (
      <MobileFrame data-testid="second-round-attendance-loading">
        <GroupHomeHeader title={snapshot.groupName} />
        <main className={styles.absentWaitingContent}>
          <p className={styles.attendanceQueryState} role="status">
            참여 여부를 확인하는 중입니다.
          </p>
        </main>
      </MobileFrame>
    );
  }

  if (isSecondRoundAbsent) {
    return (
      <MobileFrame
        data-testid="absent-participant-waiting-screen"
        data-status={group.status}
      >
        <GroupHomeHeader title={snapshot.groupName} />
        <main className={styles.absentWaitingContent}>
          <section className={styles.absentWaitingCard} aria-live="polite">
            <Clock3 aria-hidden="true" size={34} strokeWidth={1.7} />
            <h2>아직 술자리가 진행중입니다</h2>
            <p>
              모임이 종료되면 완료된 모임에서
              <br />
              결과를 확인할 수 있어요.
            </p>
          </section>
        </main>
      </MobileFrame>
    );
  }

  if (shouldCheckSecondRoundAttendance && voteStatusError) {
    return (
      <MobileFrame data-testid="second-round-attendance-error">
        <GroupHomeHeader title={snapshot.groupName} />
        <main className={styles.absentWaitingContent}>
          <p className={styles.attendanceQueryError} role="alert">
            {voteStatusError}
          </p>
        </main>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame
      data-testid="user-home"
      data-scenario={snapshot.scenario}
      data-role={snapshot.role}
      data-status={group.status}
    >
      <GroupHomeHeader title={snapshot.groupName} />

      <UserSessionContent
        groupId={params.groupId}
        snapshot={snapshot}
        statusLabel={getGroupStatusLabel(group.status)}
        teamNumber={shouldLoadMyTeam ? (myTeam?.teamNumber ?? null) : null}
        isTeamLoading={isTeamLoading}
        teamError={teamError}
        onNavigate={(href) =>
          router.push(withSessionContext(href, searchParams))
        }
        onRequestLeave={() => setLeaveDialogOpen(true)}
        onRequestEndRound={() => setEndRoundDialogOpen(true)}
        voteAction={
          group.status === "VOTING" || group.status === "VOTE_CLOSED"
            ? {
                label:
                  group.status === "VOTING"
                    ? "투표 화면으로 이동"
                    : "투표 결과 보기",
                onClick: () =>
                  router.push(
                    withSessionContext(
                      group.status === "VOTING"
                        ? groupRoutes.mvpVote(params.groupId)
                        : groupRoutes.voteResult(params.groupId),
                      searchParams,
                    ),
                  ),
              }
            : undefined
        }
      />

      {finalRoundError && (
        <Toast className={styles.toast} role="alert">
          {finalRoundError}
        </Toast>
      )}

      <UM01LeaveGroupDialog
        open={leaveDialogOpen}
        isLeaving={isLeavingGroup}
        error={leaveGroupError}
        onClose={closeLeaveDialog}
        onConfirm={confirmLeave}
      />

      <EndRoundDialog
        open={endRoundDialogOpen}
        round={snapshot.round}
        isEnding={isEndingRound}
        error={endRoundError}
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
