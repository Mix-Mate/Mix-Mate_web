import styles from "./assignment.module.css";

interface AssignmentParticipantStatusCardProps {
  round: 2;
  targetCount: number;
  absenceCount: number;
  pendingCount: number;
}

export default function AssignmentParticipantStatusCard({
  round,
  targetCount,
  absenceCount,
  pendingCount,
}: AssignmentParticipantStatusCardProps) {
  return (
    <section
      className={styles.participantStatusCard}
      aria-labelledby="assignment-participant-status-title"
    >
      <h2
        id="assignment-participant-status-title"
        className={styles.participantStatusTitle}
      >
        {round}차 참여자 현황
      </h2>

      <p className={styles.participantStatusCount}>{targetCount}명</p>

      <p className={styles.participantStatusSub}>
        불참: {absenceCount}명 · 미투표 처리: {pendingCount}명
      </p>
    </section>
  );
}
