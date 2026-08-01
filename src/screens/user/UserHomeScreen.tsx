"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import UserSessionContent from "@/features/session/components/UserSessionContent";
import { useUserSessionQuery } from "@/features/session/hooks/useUserSessionQuery";
import UM01LeaveGroupDialog from "@/modals/user/UM01LeaveGroupDialog";
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
        <header className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="이전 화면으로 이동"
          >
            <ArrowLeft aria-hidden="true" size={32} strokeWidth={2} />
          </button>
          <h1>{snapshot.groupName}</h1>
          <span className={styles.roleBadge}>{snapshot.roleLabel}</span>
        </header>

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
