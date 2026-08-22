import clsx from "clsx";
import type { TeamMember } from "../types/team.types";
import TeamMemberItem from "./TeamMemberItem";
import styles from "./team.module.css";

interface TeamMemberListProps {
  members: TeamMember[];
  onSelect: (member: TeamMember) => void;
  className?: string;
}

export default function TeamMemberList({
  members,
  onSelect,
  className,
}: TeamMemberListProps) {
  return (
    <ul
      className={clsx(styles.memberList, className)}
      aria-label="같은 조 멤버 목록"
    >
      {members.map((member) => (
        <TeamMemberItem
          key={member.participantId}
          member={member}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}
