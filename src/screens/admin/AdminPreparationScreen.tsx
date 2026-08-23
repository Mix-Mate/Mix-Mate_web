"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import AdminPreparationActions from "@/features/group/components/AdminPreparationActions";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDeleteGroupMutation } from "@/features/group/hooks/useDeleteGroupMutation";
import { getGroupStatusLabel } from "@/features/group/model/group-status";
import SessionStatusCard from "@/features/session/components/SessionStatusCard";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import DeleteGroupDialog from "@/modals/admin/DeleteGroupDialog";
import useToast from "@/shared/hooks/useToast";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./AdminPreparationScreen.module.css";

export default function AdminPreparationScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const {
    mutate: deleteGroup,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteGroupMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(
    searchParams.get("dialog") === "delete",
  );
  const { message: toast, showToast } = useToast();

  const navigateWithSession = useCallback(
    (href: string) => {
      router.push(withSessionContext(href, searchParams));
    },
    [router, searchParams],
  );

  const confirmDelete = useCallback(async () => {
    const deleted = await deleteGroup(params.groupId);
    if (!deleted) return;

    setDeleteDialogOpen(false);
    // TODO(group-delete-integration): C-03 경로가 구현되면 삭제 성공 후 해당 화면으로 이동한다.
    showToast("Mock 환경에서 그룹이 삭제되었습니다.");
  }, [deleteGroup, params.groupId, showToast]);

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="admin-preparation"
      data-group-id={group.groupId}
    >
      <Header title={group.groupName} onBack={() => router.back()} compact />

      <div className={`${styles.content} ${styles.firstRoundContent}`}>
        <SessionStatusCard
          eyebrow="진행 상태 확인"
          status={getGroupStatusLabel(group.status)}
          onClick={() =>
            navigateWithSession(groupRoutes.adminProgress(params.groupId))
          }
        />

        <AdminPreparationActions
          onStartAssignment={() =>
            navigateWithSession(
              groupRoutes.adminAssignmentSetup(params.groupId, 1),
            )
          }
          secondaryAction={{
            icon: <Trash2 aria-hidden="true" size={20} strokeWidth={1.8} />,
            label: "그룹 삭제하기",
            onClick: () => setDeleteDialogOpen(true),
            tone: "danger",
          }}
          onEditProfile={() =>
            navigateWithSession(groupRoutes.profileEdit(params.groupId))
          }
          profileActionLabel="내 프로필 조회"
          footerPlacement="flow"
        />
      </div>

      {toast && <Toast className={styles.toast}>{toast}</Toast>}

      <DeleteGroupDialog
        open={deleteDialogOpen}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </MobileFrame>
  );
}
