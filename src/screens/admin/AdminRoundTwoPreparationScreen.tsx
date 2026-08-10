"use client";

import { History } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import AdminPreparationActions from "@/features/group/components/AdminPreparationActions";
import RoundTwoStatusCard from "@/features/group/components/RoundTwoStatusCard";
import { useAdminRoundTwoPreparationQuery } from "@/features/group/hooks/useAdminRoundTwoPreparationQuery";
import { useUpdateGroupMutation } from "@/features/group/hooks/useUpdateGroupMutation";
import type { UpdateGroupInput } from "@/features/group/types/group.types";
import EditGroupDialog from "@/modals/admin/EditGroupDialog";
import useToast from "@/shared/hooks/useToast";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./AdminPreparationScreen.module.css";

export default function AdminRoundTwoPreparationScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: snapshot } = useAdminRoundTwoPreparationQuery(params.groupId);
  const { mutate: updateGroup, isPending, error } = useUpdateGroupMutation();
  const [group, setGroup] = useState(snapshot);
  const [editDialogOpen, setEditDialogOpen] = useState(
    searchParams.get("dialog") === "edit",
  );
  const { message: toast, showToast } = useToast();

  const closeEditDialog = useCallback(() => {
    setEditDialogOpen(false);
  }, []);

  const editInitialValues = useMemo<UpdateGroupInput>(
    () => ({
      name: group.name,
      description: group.description,
    }),
    [group.description, group.name],
  );

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
      data-testid="admin-round-two-preparation"
      data-group-id={group.id}
    >
      <Header title={group.name} onBack={() => router.back()} />

      <div className={styles.content}>
        <RoundTwoStatusCard
          eyebrow="진행 상태 확인"
          statusLabel={group.statusLabel}
          onEditGroup={() => setEditDialogOpen(true)}
        />

        <AdminPreparationActions
          onStartAssignment={() =>
            router.push(groupRoutes.adminAssignmentSetup(params.groupId, 2))
          }
          secondaryAction={{
            icon: <History aria-hidden="true" size={17} strokeWidth={1.8} />,
            label: "2차 참가자 명단 보기",
            onClick: () =>
              router.push(
                groupRoutes.adminRoundTwoParticipants(params.groupId),
              ),
          }}
          onEditProfile={() =>
            router.push(groupRoutes.profileEdit(params.groupId))
          }
          footerPlacement="flow"
        />
      </div>

      {toast && <Toast className={styles.toast}>{toast}</Toast>}

      <EditGroupDialog
        open={editDialogOpen}
        initialValues={editInitialValues}
        isSaving={isPending}
        error={error}
        onClose={closeEditDialog}
        onSubmit={handleUpdateGroup}
      />
    </MobileFrame>
  );
}
