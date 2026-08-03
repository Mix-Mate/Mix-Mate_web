import type { TeamMemberSummary } from "../types/team.types";
import TeamMemberItem from "./TeamMemberItem";
import styles from "./team.module.css";

interface TeamMemberListProps {
  members: TeamMemberSummary[];
  onSelect: (member: TeamMemberSummary) => void;
}

export default function TeamMemberList({
  members,
  onSelect,
}: TeamMemberListProps) {
  return (
    <ul className={styles.memberList} aria-label="같은 조 멤버 목록">
      {members.map((member) => (
        <TeamMemberItem
          key={member.id}
          member={member}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
