"use client";

import {
  BriefcaseBusiness,
  ChevronRight,
  Copy,
  Link2,
  RefreshCw,
  SquarePen,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { useCloseRecruitingMutation } from "@/features/group/hooks/useCloseRecruitingMutation";
import { useGroupInvitationQuery } from "@/features/group/hooks/useGroupInvitationQuery";
import { useInviteCodeRemainingTime } from "@/features/group/hooks/useInviteCodeRemainingTime";
import { useReissueGroupInvitationMutation } from "@/features/group/hooks/useReissueGroupInvitationMutation";
import type { GroupInvitationResponse } from "@/features/group/api/group.api";
import RecruitmentParticipantCard from "@/features/participant/components/RecruitmentParticipantCard";
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
import { formatInviteCodeRemainingTime } from "@/features/group/lib/invite-code-expiration";
import { FIRST_ROUND_MIN_PARTICIPANTS } from "@/features/group/lib/recruitment";
import { getGroupStatusLabel } from "@/features/group/model/group-status";
import RecruitmentTransitionScreen, {
  type RecruitmentTransitionPhase,
} from "@/features/group/components/RecruitmentTransitionScreen";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import GroupHomeHeader from "@/features/session/components/GroupHomeHeader";
import SpotlightOnboarding, {
  type SpotlightStep,
} from "@/features/onboarding/components/SpotlightOnboarding";
import { useHostRecruitmentOnboarding } from "@/features/onboarding/hooks/useHostRecruitmentOnboarding";
import {
  hostRecruitmentOnboardingSteps,
  type HostRecruitmentOnboardingStepId,
} from "@/features/onboarding/model/host-recruitment-onboarding-steps";
import CloseRecruitmentDialog from "@/modals/admin/CloseRecruitmentDialog";
import ReissueInvitationDialog from "@/modals/admin/ReissueInvitationDialog";
import useToast from "@/shared/hooks/useToast";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./AdminRecruitmentScreen.module.css";

const RECRUITMENT_POLLING_INTERVAL_MS = 3000;
const MIN_RECRUITMENT_TRANSITION_MS = 3000;

interface InviteCodeExpirationNoticeProps {
  createdAt: string;
  expiresAt?: string;
  isLoading?: boolean;
  error?: string | null;
  onRequestReissue: () => void;
}

function InviteCodeExpirationNotice({
  createdAt,
  expiresAt,
  isLoading = false,
  error,
  onRequestReissue,
}: InviteCodeExpirationNoticeProps) {
  const remainingTime = useInviteCodeRemainingTime(createdAt, expiresAt);

  return (
    <InfoBanner className={styles.expirationNotice}>
      <div className={styles.expirationNoticeContent}>
        <p>
          {error ? (
            error
          ) : isLoading && !expiresAt ? (
            "참여코드 만료 시간을 확인하는 중입니다."
          ) : remainingTime.remainingMs === 0 ? (
            "참여코드가 만료되었습니다."
          ) : (
            <>
              참여코드 만료까지{" "}
              <strong>{formatInviteCodeRemainingTime(remainingTime)}</strong>
            </>
          )}
        </p>
        <button
          type="button"
          className={styles.reissueButton}
          onClick={onRequestReissue}
        >
          <RefreshCw aria-hidden="true" size={14} strokeWidth={2} />
          재발급
        </button>
      </div>
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
  const [closeDialogOpen, setCloseDialogOpen] = useState(
    searchParams.get("dialog") === "close-recruitment",
  );
  const [reissueDialogOpen, setReissueDialogOpen] = useState(false);
  const [reissuedInvitation, setReissuedInvitation] =
    useState<GroupInvitationResponse | null>(null);
  const [transitionPhase, setTransitionPhase] =
    useState<RecruitmentTransitionPhase | null>(null);
  const cancelTransitionRef = useRef<(() => void) | null>(null);
  const statusCardRef = useRef<HTMLElement>(null);
  const inviteCodeCardRef = useRef<HTMLDivElement>(null);
  const inviteCodeRowRef = useRef<HTMLDivElement>(null);
  const inviteLinkRowRef = useRef<HTMLButtonElement>(null);
  const invitationNoticeRef = useRef<HTMLDivElement>(null);
  const recruitingCardRef = useRef<HTMLElement>(null);
  const participantCountRef = useRef<HTMLDivElement>(null);
  const closeRecruitmentRef = useRef<HTMLButtonElement>(null);
  const { message: toast, showToast } = useToast();
  const {
    data: participantData,
    isLoading: isParticipantListLoading,
    refetch: refetchParticipants,
  } = useParticipantListQuery(params.groupId, {
    detailRole: "admin",
    hydrateProfiles: true,
    includeTeams: false,
  });
  const canEditGroup =
    group?.myRole === "HOST" && group.status === "RECRUITING";
  const isRecruiting = group?.status === "RECRUITING";
  const {
    data: invitation,
    isLoading: isInvitationLoading,
    error: invitationError,
  } = useGroupInvitationQuery(params.groupId, { enabled: canEditGroup });
  const {
    mutate: reissueInvitation,
    isPending: isReissuingInvitation,
    error: reissueInvitationError,
  } = useReissueGroupInvitationMutation();
  const currentInvitation = reissuedInvitation ?? invitation;
  const displayedInviteCode =
    currentInvitation?.inviteCode ?? group?.inviteCode ?? "";
  const canCloseRecruitment =
    canEditGroup && group.memberCount >= FIRST_ROUND_MIN_PARTICIPANTS;
  const onboardingTargetRefs: Record<
    HostRecruitmentOnboardingStepId,
    RefObject<HTMLElement | null>
  > = {
    status: statusCardRef,
    inviteCode: inviteCodeRowRef,
    inviteLink: inviteLinkRowRef,
    inviteLinkRenewal: invitationNoticeRef,
    recruiting: recruitingCardRef,
    participantCount: participantCountRef,
    closeRecruitment: closeRecruitmentRef,
  };
  const onboardingSteps: SpotlightStep[] = hostRecruitmentOnboardingSteps.map(
    (step) => ({ ...step, targetRef: onboardingTargetRefs[step.id] }),
  );
  const { open: onboardingOpen, dismiss: dismissOnboarding } =
    useHostRecruitmentOnboarding(
      // 다이얼로그가 열린 채로 들어온 경우에는 온보딩을 띄우지 않는다.
      canEditGroup &&
        !transitionPhase &&
        !closeDialogOpen &&
        !reissueDialogOpen,
    );

  useEffect(() => {
    return () => {
      cancelTransitionRef.current?.();
      cancelTransitionRef.current = null;
    };
  }, [params.groupId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("adminToast");
      if (stored) {
        showToast(stored);
        sessionStorage.removeItem("adminToast");
      }
    }
  }, [showToast]);

  useEffect(() => {
    if (!isRecruiting || transitionPhase) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void Promise.all([refetch(), refetchParticipants()]);
    }, RECRUITMENT_POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRecruiting, refetch, refetchParticipants, transitionPhase]);

  const copyInviteCode = useCallback(async () => {
    if (!displayedInviteCode) return;

    try {
      await navigator.clipboard.writeText(displayedInviteCode);
      showToast("참여 코드가 복사되었습니다.");
    } catch {
      showToast(`참여 코드: ${displayedInviteCode}`);
    }
  }, [displayedInviteCode, showToast]);

  const copyInviteLink = useCallback(async () => {
    if (!displayedInviteCode) return;

    const invitePath = `${groupRoutes.join()}?inviteCode=${encodeURIComponent(
      displayedInviteCode,
    )}`;
    const inviteUrl = new URL(invitePath, window.location.origin).toString();

    try {
      await navigator.clipboard.writeText(inviteUrl);
      showToast("초대 링크가 복사되었습니다.");
    } catch {
      showToast(inviteUrl);
    }
  }, [displayedInviteCode, showToast]);

  const confirmReissueInvitation = useCallback(async () => {
    if (!canEditGroup || isReissuingInvitation) return;

    const result = await reissueInvitation(params.groupId);
    if (!result) return;

    setReissuedInvitation(result);
    setReissueDialogOpen(false);
    showToast("참여 코드가 재발급되었습니다.");
  }, [
    canEditGroup,
    isReissuingInvitation,
    params.groupId,
    reissueInvitation,
    showToast,
  ]);

  useEffect(() => {
    if (!group || transitionPhase) return;

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
        withSessionContext(groupRoutes.home(params.groupId), searchParams),
      );
      return;
    }

    if (group.status === "FINISHED") {
      router.replace(
        withSessionContext(groupRoutes.completed(params.groupId), searchParams),
      );
    }
  }, [group, params.groupId, router, searchParams, transitionPhase]);

  const goToParticipants = useCallback(() => {
    router.push(
      withSessionContext(
        groupRoutes.participants(params.groupId),
        searchParams,
      ),
    );
  }, [params.groupId, router, searchParams]);

  const goToGroupEdit = useCallback(() => {
    router.push(
      withSessionContext(groupRoutes.groupEdit(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  const confirmCloseRecruitment = useCallback(async () => {
    if (!canCloseRecruitment || cancelTransitionRef.current) return;

    setTransitionPhase("closing");
    let cancelled = false;
    // 실제 요청과 동시에 시작해, 전체 표시 시간이 max(실제 로딩, 3초)가 되게 한다.
    const minimumDisplay = new Promise<void>((resolve) => {
      const timeoutId = window.setTimeout(
        resolve,
        MIN_RECRUITMENT_TRANSITION_MS,
      );
      cancelTransitionRef.current = () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
        resolve();
      };
    });

    const closed = await closeRecruiting(params.groupId);
    if (cancelled) return;

    if (!closed) {
      await minimumDisplay;
      if (cancelled) return;
      cancelTransitionRef.current = null;
      setTransitionPhase(null);
      return;
    }

    setTransitionPhase("preparing");
    const [latestGroup] = await Promise.all([refetch(), minimumDisplay]);
    if (cancelled) return;

    cancelTransitionRef.current = null;
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

    setTransitionPhase(null);
    if (!latestGroup) {
      showToast("최신 그룹 정보를 불러오지 못했습니다.");
    }
  }, [
    canCloseRecruitment,
    closeRecruiting,
    params.groupId,
    refetch,
    router,
    searchParams,
    showToast,
  ]);

  if (!group) return null;

  if (transitionPhase || group.status !== "RECRUITING") {
    return (
      <RecruitmentTransitionScreen phase={transitionPhase ?? "preparing"} />
    );
  }

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="admin-recruitment"
      data-group-id={group.groupId}
    >
      <GroupHomeHeader title={group.groupName} />

      <div className={styles.content}>
        <section
          ref={statusCardRef}
          className={styles.statusCard}
          aria-label="현재 모집 상태"
        >
          <div className={styles.statusSummary}>
            <span className={styles.statusDot} aria-hidden="true" />
            <div>
              <p>진행 상태 확인</p>
              <h2>{getGroupStatusLabel(group.status)}</h2>
            </div>
          </div>

          <div ref={inviteCodeCardRef} className={styles.inviteCodeCard}>
            <div ref={inviteCodeRowRef} className={styles.inviteCodeTop}>
              <span className={styles.inviteCodeIcon} aria-hidden="true">
                <BriefcaseBusiness size={18} strokeWidth={1.7} />
              </span>
              <span className={styles.inviteCodeText}>
                <small>참여 코드</small>
                <strong>{displayedInviteCode}</strong>
              </span>
              <button
                type="button"
                className={styles.copyButton}
                aria-label={`참여 코드 ${displayedInviteCode} 복사`}
                onClick={copyInviteCode}
              >
                <Copy aria-hidden="true" size={20} strokeWidth={1.8} />
                복사
              </button>
            </div>

            <button
              ref={inviteLinkRowRef}
              type="button"
              className={styles.inviteLinkRow}
              onClick={copyInviteLink}
              aria-label="초대 링크 복사"
            >
              <span className={styles.inviteLinkIcon} aria-hidden="true">
                <Link2 size={18} strokeWidth={1.8} />
              </span>
              <span className={styles.inviteLinkText}>
                <small>초대 링크 (클릭)</small>
                <strong>MixMate.invite</strong>
              </span>
            </button>

            <button
              type="button"
              className={styles.groupEditRow}
              onClick={goToGroupEdit}
            >
              <span>
                <SquarePen aria-hidden="true" size={18} strokeWidth={1.8} />
                그룹 정보 수정
              </span>
              <ChevronRight aria-hidden="true" size={18} strokeWidth={2.2} />
            </button>
          </div>
        </section>

        <div ref={invitationNoticeRef}>
          <InviteCodeExpirationNotice
            createdAt={group.createdAt}
            expiresAt={currentInvitation?.expiresAt}
            isLoading={isInvitationLoading}
            error={currentInvitation ? null : invitationError}
            onRequestReissue={() => setReissueDialogOpen(true)}
          />
        </div>

        <RecruitmentParticipantCard
          key={params.groupId}
          ref={(element) => {
            recruitingCardRef.current = element;
            participantCountRef.current = element;
          }}
          count={group.memberCount}
          isLoading={isParticipantListLoading}
          participants={participantData.participants}
          onNavigate={goToParticipants}
        />

        <Button
          ref={closeRecruitmentRef}
          className={styles.closeRecruitmentButton}
          disabled={!canCloseRecruitment}
          onClick={() => setCloseDialogOpen(true)}
        >
          모집 마감하기
        </Button>
      </div>

      {toast && <Toast className={styles.toast}>{toast}</Toast>}

      <CloseRecruitmentDialog
        open={closeDialogOpen && canCloseRecruitment}
        isClosing={isClosingRecruitment}
        error={closeRecruitmentError}
        onClose={() => {
          if (!isClosingRecruitment) setCloseDialogOpen(false);
        }}
        onConfirm={confirmCloseRecruitment}
      />

      <ReissueInvitationDialog
        open={reissueDialogOpen}
        isReissuing={isReissuingInvitation}
        error={reissueInvitationError}
        onClose={() => {
          if (!isReissuingInvitation) setReissueDialogOpen(false);
        }}
        onConfirm={confirmReissueInvitation}
      />

      {onboardingOpen && (
        <SpotlightOnboarding
          steps={onboardingSteps}
          onDismiss={dismissOnboarding}
        />
      )}
    </MobileFrame>
  );
}
