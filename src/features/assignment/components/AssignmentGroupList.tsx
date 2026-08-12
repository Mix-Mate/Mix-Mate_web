import type { AssignmentTeam } from "../types/assignment.types";
import AssignmentGroupCard from "./AssignmentGroupCard";

interface AssignmentGroupListProps {
  teams: AssignmentTeam[];
}

export default function AssignmentGroupList({
  teams,
}: AssignmentGroupListProps) {
  return (
    <div aria-label="조 편성 결과 목록">
      {teams.map((team) => (
        <AssignmentGroupCard key={team.teamId} team={team} />
      ))}
    </div>
  );
}
