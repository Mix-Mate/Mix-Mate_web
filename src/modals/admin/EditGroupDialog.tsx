"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, SquarePen } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { updateGroupSchema } from "@/features/group/schemas/group.schemas";
import type { UpdateGroupInput } from "@/features/group/types/group.types";
import styles from "./edit-group-dialog.module.css";

interface EditGroupDialogProps {
  open: boolean;
  initialValues: UpdateGroupInput;
  isSaving?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: UpdateGroupInput) => void | Promise<void>;
}

export default function EditGroupDialog({
  open,
  initialValues,
  isSaving = false,
  error,
  onClose,
  onSubmit,
}: EditGroupDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    control,
    formState: { errors },
  } = useForm<UpdateGroupInput>({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: initialValues,
  });

  const description = useWatch({ control, name: "description" });
  const descriptionLength = description?.length ?? 0;

  useEffect(() => {
    if (!open) return;

    reset(initialValues);
    const focusFrame = window.requestAnimationFrame(() => setFocus("name"));

    return () => window.cancelAnimationFrame(focusFrame);
  }, [initialValues, open, reset, setFocus]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isSaving, onClose, open]);

  if (!open) return null;

  return (
    <div
      className={styles.scrim}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        className={styles.bottomSheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-group-title"
      >
        <span className={styles.sheetHandle} aria-hidden="true" />

        <header className={styles.dialogHeader}>
          <span className={styles.editIcon} aria-hidden="true">
            <SquarePen size={32} strokeWidth={1.8} />
          </span>
          <h2 id="edit-group-title">그룹 정보 편집</h2>
          <p>모임을 알아보기 쉽도록 정보를 정리해 주세요.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.fieldGroup}>
            <label htmlFor="edit-group-name">
              그룹명 <span aria-hidden="true">*</span>
            </label>
            <input
              id="edit-group-name"
              type="text"
              maxLength={30}
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
            <span className={styles.labelRow}>
              <label htmlFor="edit-group-description">설명 (선택)</label>
              <small>{descriptionLength}/120</small>
            </span>
            <textarea
              id="edit-group-description"
              rows={3}
              maxLength={120}
              placeholder="그룹의 목적이나 모임 정보를 입력해 주세요."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description && (
              <small className={styles.fieldError} role="alert">
                {errors.description.message}
              </small>
            )}
          </div>

          {error && (
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
      </section>
    </div>
  );
}
