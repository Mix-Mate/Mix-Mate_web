"use client";

import { History } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminPreparationActions from "@/features/group/components/AdminPreparationActions";
import RoundTwoStatusCard from "@/features/group/components/RoundTwoStatusCard";
import { useAdminRoundTwoPreparationQuery } from "@/features/group/hooks/useAdminRoundTwoPreparationQuery";
import { useUpdateGroupMutation } from "@/features/group/hooks/useUpdateGroupMutation";
import type { UpdateGroupInput } from "@/features/group/types/group.types";
import EditGroupDialog from "@/modals/admin/EditGroupDialog";
import Header from "@/shared/ui/Header";
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
    <main className={styles.viewport}>
      <section
        className={styles.phone}
        data-testid="admin-round-two-preparation"
        data-group-id={group.id}
      >
        <Header
          title={group.name}
          roleLabel={group.roleLabel}
          badgeTone="admin"
          onBack={() => router.back()}
        />

        <div className={styles.content}>
          <RoundTwoStatusCard
            eyebrow="진행 상태 확인"
            statusLabel={group.statusLabel}
            onEditGroup={() => setEditDialogOpen(true)}
          />

          <AdminPreparationActions
            onStartAssignment={() =>
              router.push(`/groups/${params.groupId}/admin/assignments/2/setup`)
            }
            secondaryAction={{
              icon: <History aria-hidden="true" size={17} strokeWidth={1.8} />,
              label: "2차 참가자 명단 보기",
              onClick: () =>
                router.push(
                  `/groups/${params.groupId}/admin/round-2/participants`,
                ),
            }}
            onEditProfile={() =>
              router.push(`/groups/${params.groupId}/profile/edit`)
            }
            footerPlacement="flow"
          />
        </div>

        {toast && (
          <div className={styles.toast} role="status">
            {toast}
          </div>
        )}

        <EditGroupDialog
          open={editDialogOpen}
          initialValues={editInitialValues}
          isSaving={isPending}
          error={error}
          onClose={closeEditDialog}
          onSubmit={handleUpdateGroup}
        />
      </section>
    </main>
  );
}
