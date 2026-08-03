"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import UserSessionContent from "@/features/session/components/UserSessionContent";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import UM01LeaveGroupDialog from "@/modals/user/UM01LeaveGroupDialog";
import Header from "@/shared/ui/Header";
import styles from "./UserHomeScreen.module.css";

export default function UserHomeScreen() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const searchParams = useSearchParams();
  const { data: snapshot } = useUserSessionQuery(
    searchParams.get("scenario") ?? undefined,
  );
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveCompleted, setLeaveCompleted] = useState(false);

  const closeLeaveDialog = useCallback(() => {
    setLeaveDialogOpen(false);
  }, []);

  const confirmLeave = useCallback(() => {
    setLeaveDialogOpen(false);
    setLeaveCompleted(true);
  }, []);

  return (
    <main className={styles.viewport}>
      <section
        className={styles.phone}
        data-testid="user-home"
        data-scenario={snapshot.scenario}
      >
        <Header
          title={snapshot.groupName}
          roleLabel={snapshot.roleLabel}
          onBack={() => router.back()}
        />

        <UserSessionContent
          groupId={params.groupId}
          snapshot={snapshot}
          onNavigate={(href) => router.push(href)}
          onRequestLeave={() => setLeaveDialogOpen(true)}
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
      </section>
    </main>
  );
}
