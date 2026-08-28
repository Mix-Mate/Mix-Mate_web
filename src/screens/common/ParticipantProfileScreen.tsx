"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, LockKeyhole, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useDeleteParticipantMutation } from "@/features/participant/hooks/useDeleteParticipantMutation";
import { useAdminParticipantListQuery } from "@/features/participant/hooks/useAdminParticipantListQuery";
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
import { useParticipantProfileQuery } from "@/features/participant/hooks/useParticipantProfileQuery";
import type { ParticipantProfile } from "@/features/participant/types/participant.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./ParticipantProfileScreen.module.css";

interface ParticipantProfileScreenProps {
  groupId: string;
  participantId: string;
}

export default function ParticipantProfileScreen({
  groupId,
  participantId,
}: ParticipantProfileScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(groupId);
  const { mutate: deleteParticipant, isPending: isDeleting } =
    useDeleteParticipantMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const roundParam = searchParams.get("round");
  const adminRound =
    roundParam === "1" || roundParam === "2"
      ? (Number(roundParam) as 1 | 2)
      : undefined;
  const resolvedRound = adminRound ?? 1;
  const isAdminView = searchParams.get("role") === "admin" || group?.myRole === "HOST";
  const { data: profileDetail } = useParticipantProfileQuery(
    groupId,
    participantId,
    { enabled: !isAdminView },
  );
  const { data: adminParticipantGroup } = useAdminParticipantListQuery(
    groupId,
    resolvedRound,
  );
  const { data: participantGroup } = useParticipantListQuery(groupId);

  const fallbackProfile = useMemo<ParticipantProfile | null>(() => {
    const adminParticipant = adminParticipantGroup.participants.find(
      (participant) => participant.id === participantId,
    );

    if (adminParticipant) {
      return adminParticipant;
    }

    const participant = participantGroup.participants.find(
      (item) => item.id === participantId,
    );

    if (!participant) {
      return null;
    }

    return {
      ...participant,
      grade: "",
      mbti: "",
      isNew: false,
      age: undefined,
      instagramId: undefined,
      bio: undefined,
    };
  }, [
    adminParticipantGroup.participants,
    participantGroup.participants,
    participantId,
  ]);

  const profile = profileDetail ?? fallbackProfile;

  if (!group || !profile) return null;

  const canDeleteParticipant =
    isAdminView && group.status === "RECRUITING";
  const shouldBlockPrivateProfile =
    profile.visibility === "private" && !isAdminView;
  const instagramText = profile.instagramId ?? "등록된 인스타 ID가 없습니다.";
  const bioText = profile.bio ?? "자기소개가 없습니다.";

  const handleDelete = async () => {
    if (!canDeleteParticipant) return;

    const result = await deleteParticipant(groupId, participantId);
    if (!result.ok) return;

    setDeleteDialogOpen(false);
    router.push(groupRoutes.adminParticipants(groupId, adminRound));
  };

  return (
    <MobileFrame className={styles.phone} viewportClassName={styles.viewport}>
      {!shouldBlockPrivateProfile && (
        <Header title="참가자 프로필" onBack={() => router.back()} />
      )}

      {!shouldBlockPrivateProfile && canDeleteParticipant && (
        <button
          type="button"
          className={styles.deleteIconButton}
          aria-label="참가자 삭제"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
      )}

      <main
        className={
          shouldBlockPrivateProfile ? styles.privateContent : styles.content
        }
      >
        {shouldBlockPrivateProfile && (
          <div className={styles.sheetHandle} aria-hidden="true" />
        )}

        <section className={styles.profileHeader}>
          <GenderAvatar gender={profile.gender} name={profile.name} size={72} />
          <h2>{profile.name}</h2>
          <p>{profile.department}</p>

          {!shouldBlockPrivateProfile && (
            <div className={styles.badges}>
              {profile.isNew && <span>신입</span>}
              {profile.role === "staff" && <span>운영진</span>}
              {profile.role === "general" && !profile.isNew && <span>일반</span>}
            </div>
          )}
        </section>

        {shouldBlockPrivateProfile ? (
          <>
            <div className={styles.privateDivider} />

            <section className={styles.privateBox}>
              <LockKeyhole size={34} />
              <strong>비공개 프로필입니다</strong>
              <p>
                해당 참가자의 상세 프로필
                <br />
                정보는 확인할 수 없습니다.
              </p>
            </section>

            <Button onClick={() => router.back()}>닫기</Button>
          </>
        ) : (
          <>
            <section className={styles.infoCard}>
              <div>
                <span>학년</span>
                <strong>{profile.grade}</strong>
              </div>

              <div>
                <span>성별</span>
                <strong>{profile.gender === "female" ? "여" : "남"}</strong>
              </div>

              <div>
                <span>소속</span>
                <strong>{profile.department}</strong>
              </div>

              <div>
                <span>MBTI</span>
                <strong>{profile.mbti}</strong>
              </div>

              <div>
                <span>나이</span>
                <strong>{profile.age ?? "등록된 나이가 없습니다."}</strong>
              </div>

              <div>
                <span>인스타 ID</span>
                <strong className={profile.instagramId ? styles.instagram : ""}>
                  {instagramText}
                </strong>
              </div>
            </section>

            <section className={styles.bioCard}>
              <span>자기소개</span>
              <p>{bioText}</p>
            </section>
          </>
        )}
      </main>

      <BottomSheetDialog
        open={deleteDialogOpen}
        titleId="delete-participant-title"
        descriptionId="delete-participant-description"
        sheetClassName={styles.deleteSheet}
        onClose={() => setDeleteDialogOpen(false)}
        closeDisabled={isDeleting}
      >
        <div className={styles.deleteDialogContent}>
          <span className={styles.warningIcon} aria-hidden="true">
            <AlertTriangle size={22} strokeWidth={1.8} />
          </span>

          <h2 id="delete-participant-title">참가자를 삭제하시겠습니까?</h2>
          <p id="delete-participant-description">
            {profile.name}님을 삭제합니다.
            <br />
            이 작업은 되돌릴 수 없습니다.
          </p>

          <div className={styles.deleteActions}>
            <Button
              variant="secondary"
              className={styles.dialogButton}
              disabled={isDeleting}
              onClick={() => setDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className={styles.dialogButton}
              disabled={isDeleting}
              onClick={handleDelete}
            >
              삭제하기
            </Button>
          </div>
        </div>
      </BottomSheetDialog>
    </MobileFrame>
  );
}
