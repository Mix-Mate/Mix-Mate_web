import type { AssignmentTeam } from "../types/assignment.types";
import InitialAvatar from "./InitialAvatar";
import styles from "./assignment-group-card.module.css";

interface AssignmentGroupCardProps {
  team: AssignmentTeam;
}

export default function AssignmentGroupCard({
  team,
}: AssignmentGroupCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.teamBadge}>{team.teamNumber}</span>
        <strong className={styles.teamLabel}>{team.teamNumber}조</strong>
        <span className={styles.teamCount}>{team.members.length}명</span>
      </div>

      <ul className={styles.memberList}>
        {team.members.map((member) => (
          <li key={member.participantId} className={styles.memberRow}>
            <InitialAvatar name={member.displayName} size={40} />
            <div className={styles.memberInfo}>
              <strong>{member.displayName}</strong>
              <small>{member.major}</small>
            </div>
            {member.fixed && (
              <span className={styles.fixedBadge}>고정</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
