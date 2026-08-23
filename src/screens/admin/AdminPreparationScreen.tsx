"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import AdminPreparationActions from "@/features/group/components/AdminPreparationActions";
import GroupEditButton from "@/features/group/components/GroupEditButton";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDeleteGroupMutation } from "@/features/group/hooks/useDeleteGroupMutation";
import { useUpdateGroupMutation } from "@/features/group/hooks/useUpdateGroupMutation";
import { getGroupStatusLabel } from "@/features/group/model/group-status";
import type { UpdateGroupInput } from "@/features/group/types/group.types";
import SessionStatusCard from "@/features/session/components/SessionStatusCard";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import DeleteGroupDialog from "@/modals/admin/DeleteGroupDialog";
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
  const { data: group, refetch } = useAdminGroupQuery(params.groupId);
  const {
    mutate: deleteGroup,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteGroupMutation();
  const {
    mutate: updateGroup,
    isPending: isSavingGroup,
    error: updateGroupError,
  } = useUpdateGroupMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(
    searchParams.get("dialog") === "delete",
  );
  const [editDialogOpen, setEditDialogOpen] = useState(
    searchParams.get("dialog") === "edit",
  );
  const { message: toast, showToast } = useToast();
  const canEditGroup =
    group?.myRole === "HOST" && group.status === "BEFORE_FIRST_ROUND";
  const editInitialValues = useMemo<UpdateGroupInput>(
    () => ({
      name: group?.groupName ?? "",
      description: group?.description ?? "",
    }),
    [group?.description, group?.groupName],
  );

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

  const handleUpdateGroup = useCallback(
    async (input: UpdateGroupInput) => {
      if (!canEditGroup) return;

      const updated = await updateGroup(params.groupId, {
        groupName: input.name,
        description: input.description,
      });
      if (!updated) return;

      const latestGroup = await refetch();
      setEditDialogOpen(false);
      showToast(
        latestGroup
          ? "그룹 정보가 수정되었습니다."
          : "수정했지만 최신 그룹 정보를 불러오지 못했습니다.",
      );
    },
    [canEditGroup, params.groupId, refetch, showToast, updateGroup],
  );

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

        {canEditGroup && (
          <GroupEditButton onClick={() => setEditDialogOpen(true)} />
        )}

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

      <EditGroupDialog
        open={editDialogOpen && canEditGroup}
        initialValues={editInitialValues}
        isSaving={isSavingGroup}
        error={updateGroupError}
        onClose={() => {
          if (!isSavingGroup) setEditDialogOpen(false);
        }}
        onSubmit={handleUpdateGroup}
      />
    </MobileFrame>
  );
}
