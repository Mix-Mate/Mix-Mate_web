"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import AdminGroupSummary from "@/features/group/components/AdminGroupSummary";
import AdminPreparationActions from "@/features/group/components/AdminPreparationActions";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDeleteGroupMutation } from "@/features/group/hooks/useDeleteGroupMutation";
import { useUpdateGroupMutation } from "@/features/group/hooks/useUpdateGroupMutation";
import type { UpdateGroupInput } from "@/features/group/types/group.types";
import AM02DeleteGroupDialog from "@/modals/admin/DeleteGroupDialog";
import EditGroupDialog from "@/modals/admin/EditGroupDialog";
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
  const { data: snapshot } = useAdminGroupQuery(params.groupId);
  const [group, setGroup] = useState(snapshot);
  const {
    mutate: deleteGroup,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteGroupMutation();
  const {
    mutate: updateGroup,
    isPending: isSaving,
    error: updateError,
  } = useUpdateGroupMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(
    searchParams.get("dialog") === "delete",
  );
  const [editDialogOpen, setEditDialogOpen] = useState(
    searchParams.get("dialog") === "edit",
  );
  const { message: toast, showToast } = useToast();

  const editInitialValues = useMemo<UpdateGroupInput>(
    () => ({
      name: group.name,
      description: group.description,
    }),
    [group.description, group.name],
  );

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

  const handleUpdateGroup = useCallback(
    async (input: UpdateGroupInput) => {
      const updatedGroup = await updateGroup(params.groupId, input);
      if (!updatedGroup) return;

      setGroup((currentGroup) => ({
        ...currentGroup,
        ...updatedGroup,
      }));
      setEditDialogOpen(false);
      showToast("그룹 정보가 수정되었습니다.");
    },
    [params.groupId, showToast, updateGroup],
  );

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="admin-preparation"
      data-group-id={group.id}
    >
      <Header title={group.name} onBack={() => router.back()} compact />

      <div className={`${styles.content} ${styles.firstRoundContent}`}>
        <AdminGroupSummary
          statusLabel={group.statusLabel}
          inviteCode={group.inviteCode}
          participantCount={group.participantCount}
          onCopy={copyInviteCode}
          onEditGroup={() => setEditDialogOpen(true)}
        />
        <AdminPreparationActions
          onStartAssignment={() =>
            router.push(groupRoutes.adminAssignmentSetup(params.groupId, 1))
          }
          secondaryAction={{
            icon: <Trash2 aria-hidden="true" size={20} strokeWidth={1.8} />,
            label: "그룹 삭제하기",
            onClick: () => setDeleteDialogOpen(true),
            tone: "danger",
          }}
          onEditProfile={() =>
            router.push(groupRoutes.profileEdit(params.groupId))
          }
          footerPlacement="flow"
        />
      </div>

      {toast && <Toast className={styles.toast}>{toast}</Toast>}

      <AM02DeleteGroupDialog
        open={deleteDialogOpen}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      <EditGroupDialog
        open={editDialogOpen}
        initialValues={editInitialValues}
        isSaving={isSaving}
        error={updateError}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleUpdateGroup}
      />
    </MobileFrame>
  );
}
