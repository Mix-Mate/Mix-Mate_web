"use client";

import { useMemo, useState } from "react";
import { Ban, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useBlockParticipantMutation } from "@/features/blacklist/hooks/useBlockParticipantMutation";
import { useAdminParticipantListQuery } from "@/features/participant/hooks/useAdminParticipantListQuery";
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
import { useParticipantProfileQuery } from "@/features/participant/hooks/useParticipantProfileQuery";
import type { ParticipantProfile } from "@/features/participant/types/participant.types";
import { useMyGroupProfileQuery } from "@/features/profile/hooks/useMyGroupProfileQuery";
import type { MyGroupProfile } from "@/features/profile/types/profile.types";
import { formatInstagramDisplay } from "@/features/profile/lib/instagram";
import useToast from "@/shared/hooks/useToast";
import { getProfileGradeLabel } from "@/shared/lib/profile-labels";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import Header from "@/shared/ui/Header";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./ParticipantProfileScreen.module.css";

interface ParticipantProfileScreenProps {
  groupId: string;
  participantId: string;
}

function toProfileFromMyGroupProfile(
  profile: MyGroupProfile,
  participantId: string,
): ParticipantProfile {
  return {
    id: participantId,
    name: profile.displayName,
    department: profile.major,
    visibility: profile.visibility === "PUBLIC" ? "public" : "private",
    role: profile.position === "STAFF" ? "staff" : "general",
    gender: profile.gender === "FEMALE" ? "female" : "male",
    grade: getProfileGradeLabel(profile.grade) ?? "",
    mbti: profile.mbti,
    age: profile.age ?? undefined,
    instagramId: profile.instaId ?? undefined,
    bio: profile.bio ?? undefined,
    isNew: profile.isNew,
  };
}

export default function ParticipantProfileScreen({
  groupId,
  participantId,
}: ParticipantProfileScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(groupId);
  const { mutate: blockParticipant, isPending: isBlocking } =
    useBlockParticipantMutation();

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockReasonError, setBlockReasonError] = useState("");
  const { message: toastMessage, showToast } = useToast();

  const roundParam = searchParams.get("round");
  const adminRound = roundParam ? toAssignmentRound(roundParam) : undefined;
  const resolvedRound = adminRound ?? 1;
  const isAdminView = group?.myRole === "HOST";
  const myParticipantId = group?.myParticipantId
    ? String(group.myParticipantId)
    : null;
  const isSelfProfile =
    myParticipantId !== null && myParticipantId === participantId;
  const { data: myProfile, isError: isMyProfileError } =
    useMyGroupProfileQuery(groupId, {
      enabled: isSelfProfile,
    });
  const shouldFetchProfileDetail =
    Boolean(group) && (!isSelfProfile || isMyProfileError);
  const {
    data: profileDetail,
    isError: isProfileDetailError,
  } = useParticipantProfileQuery(
    groupId,
    participantId,
    {
      detailRole: isAdminView ? "admin" : undefined,
      enabled: shouldFetchProfileDetail,
    },
  );
  const shouldFetchListFallback =
    Boolean(group) &&
    (!isSelfProfile || isMyProfileError) &&
    isProfileDetailError;
  const shouldFetchAdminFallback =
    shouldFetchListFallback && isAdminView;
  const shouldFetchParticipantFallback =
    shouldFetchListFallback && !isAdminView;
  const { data: adminParticipantGroup } = useAdminParticipantListQuery(
    groupId,
    resolvedRound,
    { enabled: shouldFetchAdminFallback },
  );
  const { data: participantGroup } = useParticipantListQuery(groupId, {
    detailRole: isAdminView ? "admin" : undefined,
    round: resolvedRound,
    hydrateProfiles: false,
    enabled: shouldFetchParticipantFallback,
  });

  const fallbackProfile = useMemo<ParticipantProfile | null>(() => {
    const participant = isAdminView
      ? adminParticipantGroup.participants.find(
          (item) => item.id === participantId,
        )
      : participantGroup.participants.find(
          (item) => item.id === participantId,
        );

    if (!participant) {
      return null;
    }

    return {
      ...participant,
      grade: participant.grade ?? "",
      mbti: participant.mbti ?? "",
      isNew: participant.isNew ?? false,
      age: participant.age,
      instagramId: participant.instagramId,
      bio: participant.bio,
    };
  }, [
    adminParticipantGroup.participants,
    isAdminView,
    participantGroup.participants,
    participantId,
  ]);

  const profile = useMemo(() => {
    if (isSelfProfile && myProfile) {
      return toProfileFromMyGroupProfile(
        myProfile,
        myParticipantId ?? participantId,
      );
    }

    return profileDetail ?? fallbackProfile;
  }, [
    fallbackProfile,
    isSelfProfile,
    myParticipantId,
    myProfile,
    participantId,
    profileDetail,
  ]);

  if (!group || !profile) return null;

  const isSelf = isSelfProfile;

  const canManageParticipant =
    group.status === "RECRUITING" ||
    group.status === "BEFORE_FIRST_ROUND" ||
    group.status === "BEFORE_SECOND_ROUND";
  const canBlockParticipant =
    isAdminView && !isSelf && canManageParticipant;
  const shouldBlockPrivateProfile =
    profile.visibility === "private" && !isAdminView;
  const instagramText = profile.instagramId
    ? formatInstagramDisplay(profile.instagramId)
    : "등록된 인스타 ID가 없습니다.";
  const bioText = profile.bio ?? "자기소개가 없습니다.";

  const copyInstagramId = async () => {
    if (!profile.instagramId) return;

    try {
      await navigator.clipboard.writeText(instagramText);
      showToast("인스타 ID가 복사되었습니다.");
    } catch {
      showToast(instagramText);
    }
  };

  const resolveReturnUrl = () => {
    // 1. 명시적 from 경로가 있는 경우 (예: 필터/탭 상태 포함된 이전 URL)
    const fromParam = searchParams.get("from");
    if (fromParam) {
      return decodeURIComponent(fromParam);
    }

    // 2. returnTo 파라미터가 있는 경우
    const returnToParam = searchParams.get("returnTo");
    if (returnToParam === "participant-list") {
      return groupRoutes.participants(groupId, resolvedRound);
    }
    if (returnToParam === "admin-participants") {
      return groupRoutes.adminParticipants(groupId, resolvedRound);
    }
    if (returnToParam === "recruitment") {
      return groupRoutes.adminRecruitment(groupId);
    }
    if (returnToParam === "fixed") {
      return groupRoutes.adminAssignmentFixedMembers(groupId, resolvedRound);
    }

    // 3. 투표 결과/최종 참가자 list 파라미터가 있는 경우
    const listParam = searchParams.get("list");
    if (listParam === "mvp") {
      return groupRoutes.voteResultMvpList(groupId);
    }
    if (listParam === "second-round") {
      return groupRoutes.voteResultSecondRoundParticipants(groupId);
    }

    // 4. tab 파라미터가 있는 경우 (예: team?tab=members)
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      return `/groups/${groupId}/team?tab=${tabParam}`;
    }

    // 5. 관리자 뷰인 경우
    if (isAdminView) {
      if (group?.status === "RECRUITING") {
        return groupRoutes.participants(groupId, resolvedRound);
      }
      return groupRoutes.adminParticipants(groupId, resolvedRound);
    }

    // 6. 기본 fallback: 해당 round 참가자 목록
    return groupRoutes.participants(groupId, resolvedRound);
  };

  const handleBlock = async () => {
    const trimmed = blockReason.trim();
    if (trimmed.length > 30) {
      setBlockReasonError("차단 사유는 30자를 넘을 수 없습니다.");
      return;
    }

    const result = await blockParticipant(groupId, profile, {
      reason: trimmed,
    });
    if (!result.ok) {
      setBlockReasonError(result.message);
      return;
    }

    setBlockDialogOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "adminToast",
        `${profile.name}님을 그룹에서 차단했습니다.`,
      );
    }
    router.replace(
      withSessionContext(
        resolveReturnUrl(),
        searchParams,
      ),
    );
  };

  return (
    <MobileFrame className={styles.phone} viewportClassName={styles.viewport}>
      {!shouldBlockPrivateProfile && (
        <Header title="참가자 프로필" onBack={() => router.back()} />
      )}

      {!shouldBlockPrivateProfile && canBlockParticipant && (
        <button
          type="button"
          className={styles.actionIconButton}
          aria-label="참가자 그룹 차단"
          onClick={() => {
            setBlockReason("");
            setBlockReasonError("");
            setBlockDialogOpen(true);
          }}
        >
          <Ban aria-hidden="true" size={18} strokeWidth={1.8} />
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
          <GenderAvatar
            gender={profile.gender}
            name={profile.name}
            toneKey={profile.id}
            size={72}
          />
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
                {profile.instagramId ? (
                  <button
                    type="button"
                    className={styles.instagramButton}
                    onClick={copyInstagramId}
                    aria-label={`인스타 ID ${instagramText} 복사`}
                  >
                    {instagramText}
                  </button>
                ) : (
                  <strong>{instagramText}</strong>
                )}
              </div>
            </section>

            <section className={styles.bioCard}>
              <span>자기소개</span>
              <p>{bioText}</p>
            </section>
          </>
        )}
      </main>

      {/* 참가자 차단 모달 */}
      <BottomSheetDialog
        open={blockDialogOpen}
        titleId="block-participant-title"
        descriptionId="block-participant-description"
        sheetClassName={styles.deleteSheet}
        onClose={() => setBlockDialogOpen(false)}
        closeDisabled={isBlocking}
      >
        <div className={styles.deleteDialogContent}>
          <span className={styles.warningIcon} aria-hidden="true">
            <Ban size={22} strokeWidth={1.8} />
          </span>

          <h2 id="block-participant-title">참가자를 그룹에서 차단하시겠습니까?</h2>
          <p id="block-participant-description">
            {profile.name}님을 그룹에서 차단합니다.
            <br />
            차단된 사용자는 차단 목록에서 관리할 수 있습니다.
          </p>

          <div className={styles.reasonInputWrapper}>
            <div className={styles.reasonLabelRow}>
              <label htmlFor="block-reason" className={styles.reasonLabel}>
                차단 사유 (최대 30자)
              </label>
              <span className={styles.charCounter}>
                {blockReason.length}/30
              </span>
            </div>
            <textarea
              id="block-reason"
              value={blockReason}
              maxLength={30}
              onChange={(e) => {
                const nextVal = e.target.value.slice(0, 30);
                setBlockReason(nextVal);
                if (blockReasonError) setBlockReasonError("");
              }}
              placeholder="차단 사유를 입력해주세요 (최대 30자)"
              className={styles.reasonTextarea}
              disabled={isBlocking}
            />
            {blockReasonError && (
              <span className={styles.reasonError} role="alert">
                {blockReasonError}
              </span>
            )}
          </div>

          <div className={styles.deleteActions}>
            <Button
              variant="secondary"
              className={styles.dialogButton}
              disabled={isBlocking}
              onClick={() => setBlockDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              className={styles.dialogButton}
              disabled={isBlocking}
              onClick={handleBlock}
            >
              {isBlocking ? "차단 처리 중..." : "차단하기"}
            </Button>
          </div>
        </div>
      </BottomSheetDialog>

      {toastMessage && <Toast className={styles.toast}>{toastMessage}</Toast>}
    </MobileFrame>
  );
}
