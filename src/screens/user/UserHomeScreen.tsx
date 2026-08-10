"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import UserSessionContent from "@/features/session/components/UserSessionContent";
import { useEndRoundMutation } from "@/features/session/hooks/useEndRoundMutation";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import {
  getMockGroupRole,
  withSessionContext,
} from "@/features/session/utils/session-navigation";
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
  // TODO(auth-integration): 실제 연동 시 URL이 아니라 그룹 멤버십 응답의 역할을 사용한다.
  const mockRole = getMockGroupRole(searchParams);
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
    mockRole,
  );
  const {
    mutate: endRound,
    isPending: isEndingRound,
    error: endRoundError,
  } = useEndRoundMutation();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [endRoundDialogOpen, setEndRoundDialogOpen] = useState(false);
  const [leaveCompleted, setLeaveCompleted] = useState(false);
  const isAdmin = snapshot.role === "ADMIN";
  const postVoteDialogOpen =
    isAdmin && searchParams.get("dialog") === "post-vote";

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

  const continueToRoundTwo = useCallback(() => {
    router.replace(
      `${groupRoutes.adminRoundTwoPreparation(params.groupId)}?scenario=round2-waiting&role=admin`,
    );
  }, [params.groupId, router]);

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
        onContinue={continueToRoundTwo}
        onFinish={finishGroup}
      />
    </MobileFrame>
  );
}
