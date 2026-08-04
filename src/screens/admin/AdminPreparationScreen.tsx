"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminGroupSummary from "@/features/group/components/AdminGroupSummary";
import AdminPreparationActions from "@/features/group/components/AdminPreparationActions";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDeleteGroupMutation } from "@/features/group/hooks/useDeleteGroupMutation";
import AM02DeleteGroupDialog from "@/modals/admin/DeleteGroupDialog";
import Header from "@/shared/ui/Header";
import styles from "./AdminPreparationScreen.module.css";

export default function AdminPreparationScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { mutate: deleteGroup, isPending, error } = useDeleteGroupMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(
    searchParams.get("dialog") === "delete",
  );
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const copyInviteCode = useCallback(async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(group.inviteCode);
      showToast("참여 코드가 복사되었습니다.");
    } catch {
      showToast("참여 코드를 복사하지 못했습니다.");
    }
  }, [group.inviteCode, showToast]);

  const confirmDelete = useCallback(async () => {
    const deleted = await deleteGroup(params.groupId);
    if (!deleted) return;

    setDeleteDialogOpen(false);
    // TODO(group-delete-integration): C-03 경로가 구현되면 삭제 성공 후 해당 화면으로 이동한다.
    showToast("Mock 환경에서 그룹이 삭제되었습니다.");
  }, [deleteGroup, params.groupId, showToast]);

  return (
    <main className={styles.viewport}>
      <section
        className={styles.phone}
        data-testid="admin-preparation"
        data-group-id={group.id}
      >
        <Header
          title={group.name}
          roleLabel={group.roleLabel}
          badgeTone="admin"
          onBack={() => router.back()}
        />

        <div className={styles.content}>
          <AdminGroupSummary
            statusLabel={group.statusLabel}
            inviteCode={group.inviteCode}
            participantCount={group.participantCount}
            onCopy={copyInviteCode}
          />
          <AdminPreparationActions
            onStartAssignment={() =>
              router.push(`/groups/${params.groupId}/admin/assignments/1/setup`)
            }
            onRequestDelete={() => setDeleteDialogOpen(true)}
            onEditProfile={() =>
              router.push(`/groups/${params.groupId}/profile/edit`)
            }
          />
        </div>

        {toast && (
          <div className={styles.toast} role="status">
            {toast}
          </div>
        )}

        <AM02DeleteGroupDialog
          open={deleteDialogOpen}
          isDeleting={isPending}
          error={error}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
        />
      </section>
    </main>
  );
}
