import type { FixedMemberEntry } from "../types/assignment.types";

interface FixedMemberListProps {
  fixedMembers: FixedMemberEntry[];
}

export default function FixedMemberList({
  fixedMembers,
}: FixedMemberListProps) {
  if (fixedMembers.length === 0) {
    return <p>아직 고정된 멤버가 없습니다.</p>;
  }

  return (
    <ul aria-label="고정 멤버 목록">
      {fixedMembers.map((member) => (
        <li key={member.memberId}>
          {member.memberName} · {member.teamNumber}조 고정
        </li>
      ))}
    </ul>
  );
}
