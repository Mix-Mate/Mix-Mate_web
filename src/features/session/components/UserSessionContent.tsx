import { Clock3, History, Power, Trash2, UserRoundPen } from "lucide-react";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { getEventStatusLabel } from "../model/event-status";
import type { UserHomeSnapshot } from "../types/session.types";
import SessionMenuGrid from "./SessionMenuGrid";
import SessionStatusCard from "./SessionStatusCard";
import styles from "./session.module.css";

interface UserSessionContentProps {
  groupId: string;
  snapshot: UserHomeSnapshot;
  teamNumber: number | null;
  isTeamLoading: boolean;
  teamError: string | null;
  onNavigate: (href: string) => void;
  onRequestLeave: () => void;
  onRequestEndRound: () => void;
}

export default function UserSessionContent({
  groupId,
  snapshot,
  teamNumber,
  isTeamLoading,
  teamError,
  onNavigate,
  onRequestLeave,
  onRequestEndRound,
}: UserSessionContentProps) {
  const isAssigned = teamNumber !== null;
  const isAdmin = snapshot.role === "ADMIN";
  const isRoundTwoWaiting = snapshot.scenario === "round2-waiting";
  const currentStatusLabel = getEventStatusLabel(snapshot.currentStatus);

  return (
    <div
      className={`${styles.content} ${isAdmin ? styles.adminContent : ""} ${
        isRoundTwoWaiting ? styles.roundTwoWaitingContent : ""
      }`.trim()}
    >
      <SessionStatusCard
        eyebrow={snapshot.statusEyebrow}
        status={currentStatusLabel}
        onClick={
          isAdmin && snapshot.permissions.canEndRound
            ? () => onNavigate(groupRoutes.adminProgress(groupId))
            : undefined
        }
      />

      {isTeamLoading ? (
        <section className={styles.waitingCard} aria-live="polite">
          <Clock3 aria-hidden="true" size={28} strokeWidth={1.7} />
          <strong>내 조 정보를 불러오는 중입니다</strong>
          <p>잠시만 기다려 주세요</p>
        </section>
      ) : teamError ? (
        <section className={styles.waitingCard} role="alert">
          <Clock3 aria-hidden="true" size={28} strokeWidth={1.7} />
          <strong>내 조 정보를 확인할 수 없습니다</strong>
          <p>{teamError}</p>
        </section>
      ) : isAssigned ? (
        <>
          <button
            type="button"
            className={styles.assignmentCard}
            onClick={() => onNavigate(groupRoutes.team(groupId))}
          >
            <span>나 몇 조?</span>
            <strong>배정 결과 확인하기 →</strong>
          </button>
          <SessionMenuGrid groupId={groupId} onNavigate={onNavigate} />
        </>
      ) : (
        <section className={styles.waitingCard} aria-live="polite">
          <Clock3 aria-hidden="true" size={28} strokeWidth={1.7} />
          <strong>아직 자리 배치 전입니다</strong>
          <p>
            관리자가 배치를 완료하면
            <br />
            결과를 확인할 수 있어요
          </p>
        </section>
      )}

      <div className={styles.footerActions}>
        {snapshot.permissions.canLeaveGroup && (
          <button
            type="button"
            className={`${styles.secondaryAction} ${styles.dangerAction}`}
            onClick={onRequestLeave}
          >
            <Trash2 aria-hidden="true" size={20} strokeWidth={1.8} />
            그룹 탈퇴하기
          </button>
        )}

        {snapshot.teamHistoryAvailable && (
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={() => onNavigate(groupRoutes.teamHistory(groupId))}
          >
            <History aria-hidden="true" size={20} strokeWidth={1.8} />
            이전 조 보기
          </button>
        )}

        <button
          type="button"
          className={styles.secondaryAction}
          onClick={() => onNavigate(groupRoutes.profileEdit(groupId))}
        >
          <UserRoundPen aria-hidden="true" size={20} strokeWidth={1.8} />내
          프로필 조회
        </button>
      </div>

      {snapshot.permissions.canEndRound && (
        <button
          type="button"
          className={styles.endRoundButton}
          onClick={onRequestEndRound}
        >
          <Power aria-hidden="true" size={21} strokeWidth={1.9} />
          {snapshot.round}차 술자리 종료
        </button>
      )}
    </div>
  );
}
