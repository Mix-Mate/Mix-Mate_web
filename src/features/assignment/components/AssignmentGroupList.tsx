import type { AssignmentTeam } from "../types/assignment.types";
import AssignmentGroupCard from "./AssignmentGroupCard";
import styles from "./assignment-group-card.module.css";

interface AssignmentGroupListProps {
  teams: AssignmentTeam[];
}

export default function AssignmentGroupList({
  teams,
}: AssignmentGroupListProps) {
  return (
    <div className={styles.list} aria-label="조 편성 결과 목록">
      {teams.map((team) => (
        <AssignmentGroupCard key={team.teamNumber} team={team} />
      ))}
    </div>
  );
}
