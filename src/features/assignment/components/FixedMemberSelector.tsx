"use client";

import type { AssignmentMember } from "../types/assignment.types";

interface FixedMemberSelectorProps {
  members: AssignmentMember[];
  selectedMemberIds: string[];
  onToggle: (memberId: string) => void;
}

export default function FixedMemberSelector({
  members,
  selectedMemberIds,
  onToggle,
}: FixedMemberSelectorProps) {
  return (
    <ul aria-label="고정할 참가자 선택">
      {members.map((member) => (
        <li key={member.memberId}>
          <label>
            <input
              type="checkbox"
              checked={selectedMemberIds.includes(member.memberId)}
              onChange={() => onToggle(member.memberId)}
            />
            {member.memberName}
          </label>
        </li>
      ))}
    </ul>
  );
}
