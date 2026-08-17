import GenderAvatar from "@/shared/ui/GenderAvatar";
import type {
  AssignmentTeam,
  FixedMemberCandidate,
} from "../types/assignment.types";
import styles from "./assignment-group-card.module.css";

function getMemberMeta(member: FixedMemberCandidate) {
  if (member.isNew) return `신입 · ${member.mbti}`;
  if (member.role === "staff") return `운영진 · ${member.mbti}`;
  return `${member.grade} · ${member.mbti}`;
}

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
          <li key={member.id} className={styles.memberRow}>
            <GenderAvatar
              gender={member.gender}
              name={member.name}
              size={40}
            />
            <div className={styles.memberInfo}>
              <strong>{member.name}</strong>
              <small>{getMemberMeta(member)}</small>
            </div>
            {member.fixedTeamNumber !== null && (
              <span className={styles.fixedBadge}>고정</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
