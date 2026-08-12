import type { AssignmentTeam } from "../types/assignment.types";

interface AssignmentGroupCardProps {
  team: AssignmentTeam;
}

export default function AssignmentGroupCard({
  team,
}: AssignmentGroupCardProps) {
  return (
    <article aria-label={`${team.teamNumber}조`}>
      <h3>{team.teamNumber}조</h3>
      <ul>
        {team.members.map((member) => (
          <li key={member.memberId}>{member.memberName}</li>
        ))}
      </ul>
    </article>
  );
}
