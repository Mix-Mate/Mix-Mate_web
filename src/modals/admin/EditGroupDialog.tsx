"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, SquarePen, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { updateGroupSchema } from "@/features/group/schemas/group.schemas";
import type { UpdateGroupInput } from "@/features/group/types/group.types";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import { mapServerFieldErrors } from "@/shared/lib/input-validation";
import styles from "./edit-group-dialog.module.css";

interface EditGroupDialogProps {
  open: boolean;
  initialValues: UpdateGroupInput;
  isSaving?: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string>;
  onClose: () => void;
  onDelete: () => void;
  onSubmit: (input: UpdateGroupInput) => void | Promise<void>;
}

export default function EditGroupDialog({
  open,
  initialValues,
  isSaving = false,
  error,
  fieldErrors,
  onClose,
  onDelete,
  onSubmit,
}: EditGroupDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<UpdateGroupInput>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: initialValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const descriptionValue = useWatch({ control, name: "description" }) ?? "";

  useEffect(() => {
    if (!open) return;

    reset(initialValues);
  }, [initialValues, open, reset]);

  useEffect(() => {
    if (!open || !fieldErrors) return;

    const mappedErrors = mapServerFieldErrors(fieldErrors, {
      groupName: "name",
    });
    clearErrors(["name", "description"]);
    for (const [field, message] of Object.entries(mappedErrors)) {
      if (field === "name" || field === "description") {
        setError(field, { type: "server", message });
      }
    }
  }, [clearErrors, fieldErrors, open, setError]);

  return (
    <BottomSheetDialog
      open={open}
      titleId="edit-group-title"
      scrimClassName={styles.scrim}
      sheetClassName={styles.bottomSheet}
      handleClassName={styles.sheetHandle}
      onClose={onClose}
      closeDisabled={isSaving}
    >
      <button
        type="button"
        className={styles.deleteGroupButton}
        onClick={onDelete}
        disabled={isSaving}
        aria-label="그룹 삭제하기"
      >
        <Trash2 aria-hidden="true" size={20} strokeWidth={1.8} />
      </button>

      <header className={styles.dialogHeader}>
        <span className={styles.editIcon} aria-hidden="true">
          <SquarePen size={40} strokeWidth={1.7} />
        </span>
        <h2 id="edit-group-title">그룹 정보 편집</h2>
      </header>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
            rows={2}
            placeholder="설명 입력"
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
          <div className={styles.fieldFooter}>
            {errors.description ? (
              <small className={styles.fieldError} role="alert">
                {errors.description.message}
              </small>
            ) : (
              <span />
            )}
            <span className={styles.charCounter}>
              {descriptionValue.length}/120
            </span>
          </div>
        </div>

        {error && Object.keys(fieldErrors ?? {}).length === 0 && (
          <p className={styles.submitError} role="alert">
            <CircleAlert aria-hidden="true" size={17} strokeWidth={1.8} />
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSaving}
          >
            취소
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "편집 저장하기"}
          </button>
        </div>
      </form>
    </BottomSheetDialog>
  );
}
