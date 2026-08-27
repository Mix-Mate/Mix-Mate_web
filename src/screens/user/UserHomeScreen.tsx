"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDecideSecondRoundMutation } from "@/features/group/hooks/useDecideSecondRoundMutation";
import { useLeaveGroupMutation } from "@/features/profile/hooks/useLeaveGroupMutation";
import UserSessionContent from "@/features/session/components/UserSessionContent";
import { useEndRoundMutation } from "@/features/session/hooks/useEndRoundMutation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
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
  const groupRole = group?.myRole === "HOST" ? "ADMIN" : "USER";
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
    groupRole,
  );
  const teamRound: TeamRound =
    snapshot.round === 2 ? "SECOND_ROUND" : "FIRST_ROUND";
  const {
    data: myTeam,
    isLoading: isTeamLoading,
    error: teamError,
  } = useMyTeamQuery(params.groupId, teamRound);
  const {
    mutate: endRound,
    isPending: isEndingRound,
    error: endRoundError,
  } = useEndRoundMutation();
  const {
    mutate: decideSecondRound,
    isPending: isDecidingSecondRound,
    error: decideSecondRoundError,
  } = useDecideSecondRoundMutation();
  const { mutate: leaveGroup, isPending: isLeavingGroup } =
    useLeaveGroupMutation();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [endRoundDialogOpen, setEndRoundDialogOpen] = useState(false);
  const [leaveCompletedMessage, setLeaveCompletedMessage] = useState("");
  const [statusRefreshError, setStatusRefreshError] = useState<string | null>(
    null,
  );
  const [isRefreshingGroup, setIsRefreshingGroup] = useState(false);
  const isAdmin = group?.myRole === "HOST";
  const canDecideSecondRound = isAdmin && group.status === "VOTE_CLOSED";
  const isSecondRoundDecisionPending =
    isDecidingSecondRound || isRefreshingGroup;
  const secondRoundDecisionError =
    statusRefreshError ?? decideSecondRoundError;
  const postVoteDialogOpen =
    canDecideSecondRound && searchParams.get("dialog") === "post-vote";

  const closeLeaveDialog = useCallback(() => {
    if (!isLeavingGroup) setLeaveDialogOpen(false);
  }, [isLeavingGroup]);

  const confirmLeave = useCallback(async () => {
    const result = await leaveGroup(params.groupId);
    if (!result.ok) {
      setLeaveCompletedMessage(result.message);
      return;
    }

    setLeaveDialogOpen(false);
    setLeaveCompletedMessage("그룹 탈퇴가 처리됐습니다.");
  }, [leaveGroup, params.groupId]);

  const closeEndRoundDialog = useCallback(() => {
    if (!isEndingRound) setEndRoundDialogOpen(false);
  }, [isEndingRound]);

  const confirmEndRound = useCallback(async () => {
    const result = await endRound(params.groupId, snapshot.round);
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
  }, [endRound, params.groupId, router, searchParams, snapshot.round]);

  const continueToRoundTwo = useCallback(async () => {
    if (!canDecideSecondRound || isSecondRoundDecisionPending) return;

    setStatusRefreshError(null);

    const didDecide = await decideSecondRound(params.groupId);
    if (!didDecide) return;

    setIsRefreshingGroup(true);

    try {
      const refreshedGroup = await refetchGroup();

      if (!refreshedGroup) {
        setStatusRefreshError("그룹 상태를 다시 확인하지 못했습니다.");
        return;
      }

      if (refreshedGroup.status !== "BEFORE_SECOND_ROUND") {
        setStatusRefreshError("2차 준비 상태를 확인하지 못했습니다.");
        return;
      }

      router.replace(groupRoutes.adminPreparation(params.groupId));
    } finally {
      setIsRefreshingGroup(false);
    }
  }, [
    canDecideSecondRound,
    decideSecondRound,
    isSecondRoundDecisionPending,
    params.groupId,
    refetchGroup,
    router,
  ]);

  const finishGroup = useCallback(() => {
    router.replace(
      withSessionContext(groupRoutes.completed(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  return (
    <MobileFrame
      data-testid="user-home"
      data-scenario={snapshot.scenario}
      data-role={snapshot.role}
    >
      <Header title={snapshot.groupName} onBack={() => router.back()} />

      <UserSessionContent
        groupId={params.groupId}
        snapshot={snapshot}
        teamNumber={myTeam?.teamNumber ?? null}
        isTeamLoading={isTeamLoading}
        teamError={teamError}
        onNavigate={(href) =>
          router.push(withSessionContext(href, searchParams))
        }
        onRequestLeave={() => setLeaveDialogOpen(true)}
        onRequestEndRound={() => setEndRoundDialogOpen(true)}
      />

      {leaveCompletedMessage && (
        <Toast className={styles.toast}>{leaveCompletedMessage}</Toast>
      )}

      <UM01LeaveGroupDialog
        open={leaveDialogOpen}
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
        onContinue={continueToRoundTwo}
        onFinish={finishGroup}
      />
    </MobileFrame>
  );
}
