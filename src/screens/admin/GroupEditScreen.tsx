"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, CircleAlert, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDeleteGroupMutation } from "@/features/group/hooks/useDeleteGroupMutation";
import { useUpdateGroupMutation } from "@/features/group/hooks/useUpdateGroupMutation";
import { updateGroupSchema } from "@/features/group/schemas/group.schemas";
import type { UpdateGroupInput } from "@/features/group/types/group.types";
import DeleteGroupDialog from "@/modals/admin/DeleteGroupDialog";
import { mapServerFieldErrors } from "@/shared/lib/input-validation";
import { appRoutes, groupRoutes } from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./GroupEditScreen.module.css";

export default function GroupEditScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const { data: group, refetch } = useAdminGroupQuery(params.groupId);
  const {
    mutate: updateGroup,
    isPending: isSavingGroup,
    error: updateGroupError,
    fieldErrors: updateGroupFieldErrors,
  } = useUpdateGroupMutation();
  const {
    mutate: deleteGroup,
    isPending: isDeletingGroup,
    error: deleteGroupError,
  } = useDeleteGroupMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const canEditGroup =
    group?.myRole === "HOST" && group.status === "RECRUITING";
  const initialValues = useMemo<UpdateGroupInput>(
    () => ({
      name: group?.groupName ?? "",
      description: group?.description ?? "",
    }),
    [group?.description, group?.groupName],
  );
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<UpdateGroupInput>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: initialValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    const mappedErrors = mapServerFieldErrors(updateGroupFieldErrors, {
      groupName: "name",
    });
    clearErrors(["name", "description"]);
    for (const [field, message] of Object.entries(mappedErrors)) {
      if (field === "name" || field === "description") {
        setError(field, { type: "server", message });
      }
    }
  }, [clearErrors, setError, updateGroupFieldErrors]);

  useEffect(() => {
    if (group && !canEditGroup) {
      router.replace(groupRoutes.home(params.groupId));
    }
  }, [canEditGroup, group, params.groupId, router]);

  const goBack = useCallback(() => {
    if (isSavingGroup || isDeletingGroup) return;
    router.back();
  }, [isDeletingGroup, isSavingGroup, router]);

  const handleUpdateGroup = useCallback(
    async (input: UpdateGroupInput) => {
      if (!canEditGroup || isSavingGroup) return;

      const updated = await updateGroup(params.groupId, {
        groupName: input.name,
        description: input.description,
      });
      if (!updated) return;

      const latestGroup = await refetch();
      window.sessionStorage.setItem(
        "adminToast",
        latestGroup
          ? "그룹 정보가 수정되었습니다."
          : "수정했지만 최신 그룹 정보를 불러오지 못했습니다.",
      );
      router.back();
    },
    [canEditGroup, isSavingGroup, params.groupId, refetch, router, updateGroup],
  );

  const confirmDeleteGroup = useCallback(async () => {
    if (!canEditGroup || isDeletingGroup) return;

    const deleted = await deleteGroup(params.groupId);
    if (!deleted) return;

    setDeleteDialogOpen(false);
    router.replace(appRoutes.home());
  }, [canEditGroup, deleteGroup, isDeletingGroup, params.groupId, router]);

  if (!group || !canEditGroup) return null;

  return (
    <MobileFrame
      className={styles.screen}
      viewportClassName={styles.viewport}
      data-testid="group-edit-screen"
    >
      <Header title="그룹 정보 수정" onBack={goBack} compact />

      <main className={styles.content}>
        <form
          id="group-edit-form"
          className={styles.form}
          onSubmit={handleSubmit(handleUpdateGroup)}
        >
          <div className={styles.fieldGroup}>
            <label htmlFor="edit-group-name">
              그룹명 <span aria-hidden="true">*</span>
            </label>
            <input
              id="edit-group-name"
              type="text"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <small className={styles.fieldError} role="alert">
                {errors.name.message}
              </small>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="edit-group-description">설명 (선택)</label>
            <textarea
              id="edit-group-description"
              rows={4}
              placeholder="그룹에 대한 설명을 입력해주세요."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description && (
              <small className={styles.fieldError} role="alert">
                {errors.description.message}
              </small>
            )}
          </div>

          {updateGroupError &&
            Object.keys(updateGroupFieldErrors ?? {}).length === 0 && (
              <p className={styles.submitError} role="alert">
                <CircleAlert aria-hidden="true" size={17} strokeWidth={1.8} />
                {updateGroupError}
              </p>
            )}

          <button
            type="button"
            className={styles.deleteGroupRow}
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isSavingGroup}
          >
            <span>
              <Trash2 aria-hidden="true" size={20} strokeWidth={1.8} />
              그룹 삭제하기
            </span>
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
          </button>
        </form>

        <Button
          type="submit"
          form="group-edit-form"
          className={styles.saveButton}
          disabled={isSavingGroup}
        >
          {isSavingGroup ? "저장 중..." : "변경사항 저장"}
        </Button>
      </main>

      <DeleteGroupDialog
        open={deleteDialogOpen}
        isDeleting={isDeletingGroup}
        error={deleteGroupError}
        onClose={() => {
          if (!isDeletingGroup) setDeleteDialogOpen(false);
        }}
        onConfirm={confirmDeleteGroup}
      />
    </MobileFrame>
  );
}
