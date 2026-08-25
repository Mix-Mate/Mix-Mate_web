import type { SecondRoundVoteParticipant } from "../../types/secondRoundVoteStatus.types";
import styles from "./VoteStatus.module.css";
import VoteStatusItem from "./VoteStatusItem";

interface VoteStatusListProps {
  title: string;
  members: SecondRoundVoteParticipant[];
  emptyMessage: string;
}

export default function VoteStatusList({
  title,
  members,
  emptyMessage,
}: VoteStatusListProps) {
  return (
    <section
      className={styles.statusListSection}
      aria-labelledby="vote-status-list-title"
    >
      <h2 id="vote-status-list-title">{title}</h2>

      {members.length > 0 ? (
        <ul className={styles.statusList}>
          {members.map((member) => (
            <VoteStatusItem key={member.participantId} member={member} />
          ))}
        </ul>
      ) : (
        <p className={styles.allComplete}>{emptyMessage}</p>
      )}
    </section>
  );
}
