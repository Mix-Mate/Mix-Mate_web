"use client";

import { BriefcaseBusiness, Clock3, Copy, Pencil } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useCloseRecruitingMutation } from "@/features/group/hooks/useCloseRecruitingMutation";
import { useDeleteGroupMutation } from "@/features/group/hooks/useDeleteGroupMutation";
import { useInviteCodeRemainingTime } from "@/features/group/hooks/useInviteCodeRemainingTime";
import { useUpdateGroupMutation } from "@/features/group/hooks/useUpdateGroupMutation";
import { formatInviteCodeRemainingTime } from "@/features/group/lib/invite-code-expiration";
import { getGroupStatusLabel } from "@/features/group/model/group-status";
import type { UpdateGroupInput } from "@/features/group/types/group.types";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import CloseRecruitmentDialog from "@/modals/admin/CloseRecruitmentDialog";
import DeleteGroupDialog from "@/modals/admin/DeleteGroupDialog";
import EditGroupDialog from "@/modals/admin/EditGroupDialog";
import useToast from "@/shared/hooks/useToast";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./AdminRecruitmentScreen.module.css";

const RECRUITMENT_POLLING_INTERVAL_MS = 3000;

interface InviteCodeExpirationNoticeProps {
  createdAt: string;
}

function InviteCodeExpirationNotice({
  createdAt,
}: InviteCodeExpirationNoticeProps) {
  const remainingTime = useInviteCodeRemainingTime(createdAt);

  return (
    <InfoBanner className={styles.expirationNotice}>
      <p>
        {remainingTime.remainingMs === 0 ? (
          "참여코드가 만료되었습니다."
        ) : (
          <>
            참여코드 만료까지{" "}
            <strong>{formatInviteCodeRemainingTime(remainingTime)}</strong>
          </>
        )}
      </p>
    </InfoBanner>
  );
}

export default function AdminRecruitmentScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group, refetch } = useAdminGroupQuery(params.groupId);
  const {
    mutate: closeRecruiting,
    isPending: isClosingRecruitment,
    error: closeRecruitmentError,
  } = useCloseRecruitingMutation();
  const {
    mutate: updateGroup,
    isPending: isSavingGroup,
    error: updateGroupError,
  } = useUpdateGroupMutation();
  const {
    mutate: deleteGroup,
    isPending: isDeletingGroup,
    error: deleteGroupError,
  } = useDeleteGroupMutation();
  const [closeDialogOpen, setCloseDialogOpen] = useState(
    searchParams.get("dialog") === "close-recruitment",
  );
  const [editDialogOpen, setEditDialogOpen] = useState(
    searchParams.get("dialog") === "edit",
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(
    searchParams.get("dialog") === "delete",
  );
  const { message: toast, showToast } = useToast();
  const canEditGroup =
    group?.myRole === "HOST" && group.status === "RECRUITING";
  const isRecruiting = group?.status === "RECRUITING";
  const editInitialValues = useMemo<UpdateGroupInput>(
    () => ({
      name: group?.groupName ?? "",
      description: group?.description ?? "",
    }),
    [group?.description, group?.groupName],
  );

  useEffect(() => {
    if (!isRecruiting) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refetch();
    }, RECRUITMENT_POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRecruiting, refetch]);

  const copyInviteCode = useCallback(async () => {
    if (!group) return;

    try {
      await navigator.clipboard.writeText(group.inviteCode);
      showToast("그룹 코드가 복사되었습니다.");
    } catch {
      showToast(`그룹 코드: ${group.inviteCode}`);
    }
  }, [group, showToast]);

  useEffect(() => {
    if (!group) return;

    if (
      group.status === "BEFORE_FIRST_ROUND" ||
      group.status === "BEFORE_SECOND_ROUND"
    ) {
      router.replace(
        withSessionContext(
          groupRoutes.adminPreparation(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (
      group.status === "FIRST_ROUND" ||
      group.status === "SECOND_ROUND" ||
      group.status === "VOTING" ||
      group.status === "VOTE_CLOSED"
    ) {
      router.replace(
        withSessionContext(
          groupRoutes.adminProgress(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (group.status === "FINISHED") {
      router.replace(
        withSessionContext(
          groupRoutes.completed(params.groupId),
          searchParams,
        ),
      );
    }
  }, [group, params.groupId, router, searchParams]);

  const goToParticipants = useCallback(() => {
    router.push(
      withSessionContext(
        groupRoutes.participants(params.groupId),
        searchParams,
      ),
    );
  }, [params.groupId, router, searchParams]);

  const confirmCloseRecruitment = useCallback(async () => {
    const closed = await closeRecruiting(params.groupId);
    if (!closed) return;

    const latestGroup = await refetch();
    setCloseDialogOpen(false);

    if (latestGroup?.status === "BEFORE_FIRST_ROUND") {
      router.replace(
        withSessionContext(
          groupRoutes.adminPreparation(params.groupId),
          searchParams,
        ),
      );
      return;
    }

    if (!latestGroup) {
      showToast("최신 그룹 정보를 불러오지 못했습니다.");
    }
  }, [
    closeRecruiting,
    params.groupId,
    refetch,
    router,
    searchParams,
    showToast,
  ]);

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

  const openDeleteDialog = useCallback(() => {
    setEditDialogOpen(false);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeleteGroup = useCallback(async () => {
    if (!canEditGroup) return;

    const deleted = await deleteGroup(params.groupId);
    if (!deleted) return;

    setDeleteDialogOpen(false);
    router.replace("/");
    //TODO 그룹홈 라우팅
  }, [canEditGroup, deleteGroup, params.groupId, router]);

  if (!group) return null;

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="admin-recruitment"
      data-group-id={group.groupId}
    >
      <Header
        title={group.groupName}
        onBack={() => router.back()}
        compact
        rightAction={
          canEditGroup ? (
            <button
              type="button"
              className={styles.editGroupButton}
              aria-label="그룹 정보 편집"
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil aria-hidden="true" size={19} strokeWidth={1.8} />
            </button>
          ) : undefined
        }
      />

      <div className={styles.content}>
        <section className={styles.statusCard} aria-label="현재 모집 상태">
          <div className={styles.statusSummary}>
            <span className={styles.statusDot} aria-hidden="true" />
            <div>
              <p>진행 상태 확인</p>
              <h2>{getGroupStatusLabel(group.status)}</h2>
            </div>
          </div>

          <div className={styles.inviteCodeCard}>
            <span className={styles.inviteCodeIcon} aria-hidden="true">
              <BriefcaseBusiness size={22} strokeWidth={1.7} />
            </span>
            <span className={styles.inviteCodeText}>
              <small>그룹 코드</small>
              <strong>{group.inviteCode}</strong>
            </span>
            <button
              type="button"
              className={styles.copyButton}
              aria-label={`그룹 코드 ${group.inviteCode} 복사`}
              onClick={copyInviteCode}
            >
              <Copy aria-hidden="true" size={17} strokeWidth={1.8} />
              복사
            </button>
          </div>
        </section>

        <InviteCodeExpirationNotice createdAt={group.createdAt} />

        <section className={styles.recruitingCard}>
          <span className={styles.clockIcon} aria-hidden="true">
            <Clock3 size={25} strokeWidth={1.8} />
          </span>
          <h2>그룹을 모집하고 있습니다.</h2>
          <p>
            모집이 마감 이후 확정된 참가자 목록을 확인하고
            <br />조 편성을 시작할 수 있습니다.
          </p>
        </section>

        <button
          type="button"
          className={styles.participantCountCard}
          aria-label={`현재 모집된 인원 ${group.memberCount}명, 참가자 목록 보기`}
          onClick={goToParticipants}
        >
          <span className={styles.participantCountInfo}>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} aria-hidden="true" />
              실시간 집계
            </span>
            <span className={styles.participantCountLabel}>
              현재 모집된 인원
            </span>
          </span>
          <span className={styles.participantCountValue}>
            <strong>{group.memberCount}</strong>
            <span>명</span>
          </span>
        </button>

        <Button
          className={styles.closeRecruitmentButton}
          disabled={group.status !== "RECRUITING"}
          onClick={() => setCloseDialogOpen(true)}
        >
          모집 마감하기
        </Button>
      </div>

      {toast && <Toast className={styles.toast}>{toast}</Toast>}

      <CloseRecruitmentDialog
        open={closeDialogOpen}
        isClosing={isClosingRecruitment}
        error={closeRecruitmentError}
        onClose={() => {
          if (!isClosingRecruitment) setCloseDialogOpen(false);
        }}
        onConfirm={confirmCloseRecruitment}
      />

      <EditGroupDialog
        open={editDialogOpen && canEditGroup}
        initialValues={editInitialValues}
        isSaving={isSavingGroup}
        error={updateGroupError}
        onClose={() => {
          if (!isSavingGroup) setEditDialogOpen(false);
        }}
        onDelete={openDeleteDialog}
        onSubmit={handleUpdateGroup}
      />

      <DeleteGroupDialog
        open={deleteDialogOpen && canEditGroup}
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
