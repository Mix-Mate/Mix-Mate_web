import { CircleCheck } from "lucide-react";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import type { SecondRoundParticipant } from "../../types/voteResult.types";
import styles from "./VoteResult.module.css";

interface AttendanceResultSummaryProps {
  participants: SecondRoundParticipant[];
}

export default function AttendanceResultSummary({
  participants,
}: AttendanceResultSummaryProps) {
  return (
    <aside
      className={styles.resultSummary}
      aria-labelledby="attendance-result-title"
    >
      <div className={styles.resultSummaryHeader}>
        <CircleCheck aria-hidden="true" size={16} strokeWidth={1.8} />
        <p>
          <strong id="attendance-result-title">
            2차 참여자 {participants.length}명
          </strong>
          <span>확정된 2차 참여자 명단입니다.</span>
        </p>
      </div>

      {participants.length > 0 ? (
        <ul
          className={styles.secondRoundParticipantList}
          aria-label="2차 참여자 명단"
        >
          {participants.map((participant) => (
            <li key={participant.participantId}>
              <GenderAvatar
                gender={participant.gender === "FEMALE" ? "female" : "male"}
                name={participant.displayName}
                size={32}
                shape="circle"
              />
              <span>
                <strong>{participant.displayName}</strong>
                <small>
                  {participant.visibility === "PUBLIC"
                    ? participant.major
                    : "프로필 비공개"}
                </small>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.emptySecondRoundParticipants}>
          2차 참여자가 없습니다.
        </p>
      )}
    </aside>
  );
}
