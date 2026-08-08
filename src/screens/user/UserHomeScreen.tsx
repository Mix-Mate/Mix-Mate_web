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
import UM01LeaveGroupDialog from "@/modals/user/LeaveGroupDialog";
import Header from "@/shared/ui/Header";
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
        withSessionContext(
          `/groups/${params.groupId}/votes/mvp`,
          searchParams,
        ),
      );
      return;
    }

    router.replace(`/groups/${params.groupId}/home`);
  }, [endRound, params.groupId, router, searchParams, snapshot.round]);

  return (
    <main className={styles.viewport}>
      <section
        className={styles.phone}
        data-testid="user-home"
        data-scenario={snapshot.scenario}
        data-role={snapshot.role}
      >
        <Header
          title={snapshot.groupName}
          onBack={() => router.back()}
        />

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
          <div className={styles.toast} role="status">
            Mock 환경에서 그룹 탈퇴가 처리됐습니다.
          </div>
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
      </section>
    </main>
  );
}
