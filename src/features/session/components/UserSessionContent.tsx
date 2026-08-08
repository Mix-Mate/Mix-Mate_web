import {
  Clock3,
  History,
  Power,
  Trash2,
  UserRoundPen,
} from "lucide-react";
import type { UserHomeSnapshot } from "../types/session.types";
import SessionMenuGrid from "./SessionMenuGrid";
import SessionStatusCard from "./SessionStatusCard";
import styles from "./session.module.css";

interface UserSessionContentProps {
  groupId: string;
  snapshot: UserHomeSnapshot;
  onNavigate: (href: string) => void;
  onRequestLeave: () => void;
  onRequestEndRound: () => void;
}

export default function UserSessionContent({
  groupId,
  snapshot,
  onNavigate,
  onRequestLeave,
  onRequestEndRound,
}: UserSessionContentProps) {
  const isAssigned = snapshot.teamNumber !== null;
  const isAdmin = snapshot.role === "ADMIN";
  const isRoundTwoWaiting = snapshot.scenario === "round2-waiting";

  return (
    <div
      className={`${styles.content} ${isAdmin ? styles.adminContent : ""} ${
        isRoundTwoWaiting ? styles.roundTwoWaitingContent : ""
      }`.trim()}
    >
      <SessionStatusCard
        eyebrow={snapshot.statusEyebrow}
        status={snapshot.statusLabel}
        onClick={
          isAdmin && snapshot.round === 1 && snapshot.permissions.canEndRound
            ? () => onNavigate(`/groups/${groupId}/admin/progress`)
            : undefined
        }
      />

      {isAssigned ? (
        <>
          <button
            type="button"
            className={styles.assignmentCard}
            onClick={() => onNavigate(`/groups/${groupId}/team`)}
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
            onClick={() => {
              // TODO(team-history-integration): 이전 조 기록 페이지가 완성되면 이 전용 경로에서 연결한다.
              onNavigate(`/groups/${groupId}/team/history`);
            }}
          >
            <History aria-hidden="true" size={20} strokeWidth={1.8} />
            이전 조 기록 보기
          </button>
        )}

        <button
          type="button"
          className={styles.secondaryAction}
          onClick={() => onNavigate(`/groups/${groupId}/profile/edit`)}
        >
          <UserRoundPen aria-hidden="true" size={20} strokeWidth={1.8} />
          내 프로필 수정
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
