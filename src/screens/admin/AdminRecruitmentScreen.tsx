"use client";

import { BriefcaseBusiness, Clock3, Copy } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { withSessionContext } from "@/features/session/utils/session-navigation";
import CloseRecruitmentDialog from "@/modals/admin/CloseRecruitmentDialog";
import useToast from "@/shared/hooks/useToast";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import Button from "@/shared/ui/Button";
import Header from "@/shared/ui/Header";
import InfoBanner from "@/shared/ui/InfoBanner";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./AdminRecruitmentScreen.module.css";

export default function AdminRecruitmentScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const [closeDialogOpen, setCloseDialogOpen] = useState(
    searchParams.get("dialog") === "close-recruitment",
  );
  const { message: toast, showToast } = useToast();

  const copyInviteCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(group.inviteCode);
      showToast("그룹 코드가 복사되었습니다.");
    } catch {
      showToast(`그룹 코드: ${group.inviteCode}`);
    }
  }, [group.inviteCode, showToast]);

  const goToParticipants = useCallback(() => {
    router.push(
      withSessionContext(groupRoutes.participants(params.groupId), searchParams),
    );
  }, [params.groupId, router, searchParams]);

  const closeRecruitment = useCallback(() => {
    setCloseDialogOpen(false);
    router.replace(
      `${groupRoutes.adminPreparation(params.groupId)}?scenario=round1-waiting&role=admin`,
    );
  }, [params.groupId, router]);

  return (
    <MobileFrame
      className={styles.phone}
      viewportClassName={styles.viewport}
      data-testid="admin-recruitment"
      data-group-id={group.id}
    >
      <Header title={group.name} onBack={() => router.back()} compact />

      <div className={styles.content}>
        <section className={styles.statusCard} aria-label="현재 모집 상태">
          <div className={styles.statusSummary}>
            <span className={styles.statusDot} aria-hidden="true" />
            <div>
              <p>진행 상태 확인</p>
              <h2>그룹 모집 중</h2>
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

        <InfoBanner className={styles.expirationNotice}>
          <p>
            참여코드는 발급 후 <strong>3일간</strong> 유효합니다.
          </p>
        </InfoBanner>

        <section className={styles.recruitingCard}>
          <span className={styles.clockIcon} aria-hidden="true">
            <Clock3 size={25} strokeWidth={1.8} />
          </span>
          <h2>그룹을 모집하고 있습니다.</h2>
          <p>
            모집이 마감 이후 확정된 참가자 목록을 확인하고
            <br />
            조 편성을 시작할 수 있습니다.
          </p>
        </section>

        <button
          type="button"
          className={styles.participantCountCard}
          aria-label={`현재 모집된 인원 ${group.participantCount}명, 참가자 목록 보기`}
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
            <strong>{group.participantCount}</strong>
            <span>명</span>
          </span>
        </button>

        <Button
          className={styles.closeRecruitmentButton}
          onClick={() => setCloseDialogOpen(true)}
        >
          모집 마감하기
        </Button>
      </div>

      {toast && <Toast className={styles.toast}>{toast}</Toast>}

      <CloseRecruitmentDialog
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
        onConfirm={closeRecruitment}
      />
    </MobileFrame>
  );
}
